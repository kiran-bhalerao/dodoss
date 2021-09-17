import type { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import type {
  AccountInfo,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { ProgramBase } from "src/program/lib/base";
import { fixedSizeStringArray } from "src/program/lib/fixedSizeStringArray";
import { Lock } from "src/program/lib/lock";

const DODO_SEED = "DODO";
const DODO_SIZE =
  124 * 4 + // title 124 chars
  24 * 4 + // tagline 24 chars
  1 + // state 1byte (0,1,2)
  8 + // create_time 8bytes (timestamp)
  8 + // update_time 8bytes (timestamp)
  1 * 32; // creator array of 32 bytes

const UPDATE_DODO_SCHEMA = [
  { key: "state", type: "u8" },
  { key: "update_time", type: "u64" },
];

const CREATE_DODO_SCHEMA = [
  { key: "title", type: "[char;124]" },
  { key: "tagline", type: "[char;24]" },
  { key: "state", type: "u8" },
  { key: "create_time", type: "u64" },
  { key: "update_time", type: "u64" },
];

const DODO_SCHEMA = [
  ...CREATE_DODO_SCHEMA,
  { key: "creator", type: "[u8;32]" },
];

enum DODO_INSTRUCTIONS {
  CREATE,
  UPDATE,
  REMOVE,
}

export enum DODO_STATE {
  TODO,
  IN_PROGRESS,
  COMPLETED,
}

type DodoData = {
  title: string;
  tagline: string;
  state: DODO_STATE;
  create_time: number;
  update_time: number;
  creator?: string;
};

class DodoBase extends ProgramBase<DodoData> {
  seed(args: { seedKey: string | number }) {
    return `${DODO_SEED}__${args.seedKey}`;
  }

  decode(info: AccountInfo<Buffer>) {
    const { title, tagline, state, create_time, update_time, creator } =
      super.decodeInfo(info, DODO_SCHEMA);

    return {
      title: super.decodeStr(title),
      tagline: super.decodeStr(tagline),
      state: Number(state),
      create_time: Number(create_time),
      update_time: Number(update_time),
      creator: super.decodePubKey(creator as unknown as number[]).toString(),
    };
  }
}

export class Dodo {
  private static BASE = new DodoBase();
  private static STARTING_INDEX = 0; // now worry, these indexes are user specific
  private static NEXT_INDEX = new Lock(-1); // to create Dodo pda we need a seed that must be unique and retraceable, its like database document id's.

  private constructor(public publicKey: PublicKey, public data: DodoData) {}

  public static async fetch(ins: {
    connection: Connection;
    walletPk: PublicKey;
    programId: PublicKey;
    dodoPk?: PublicKey; // fetch by public key
    index?: number; // if public key is not available, we can create public key from index seed
  }) {
    let { dodoPk } = ins;
    const { connection, walletPk, programId, index } = ins;

    if (!dodoPk) {
      if (index === null || index === undefined) {
        throw new Error("Invalid fetch index");
      }

      dodoPk = await Dodo.BASE.publicKeyFromSeed({
        walletPk,
        programId,
        seedKey: index, // we will treat the index as seed key.. so we feed new index as seed key to generate new seed
      });
    }

    const dodoInfo = await connection.getAccountInfo(dodoPk);

    if (!dodoInfo) {
      return null;
    }

    const data = Dodo.BASE.decode(dodoInfo);
    return new Dodo(dodoPk, data);
  }

  public static async fetchAll(
    conn: Connection,
    walletPk: PublicKey,
    programId: PublicKey
  ) {
    const dodos: Dodo[] = [];

    let index = Dodo.STARTING_INDEX;

    Dodo.NEXT_INDEX.lock();
    while (true) {
      // Fetch the Dodo at index
      const dodo = await Dodo.fetch({
        index,
        walletPk,
        programId,
        connection: conn,
      });

      if (dodo) {
        dodos.push(dodo);
      } else {
        Dodo.NEXT_INDEX.value = index;
        break;
      }

      // Increment index to search for next dodo
      index++;
    }

    Dodo.NEXT_INDEX.unlock();
    return dodos;
  }

  static async create(ins: {
    wallet: BaseSignerWalletAdapter;
    connection: Connection;
    programId: PublicKey;
    dodoData: DodoData;
  }) {
    const { wallet, connection, programId, dodoData } = ins;

    const walletPk = wallet.publicKey;
    if (!walletPk) {
      throw new Error("The wallet does not have a public key");
    }

    const instructions: TransactionInstruction[] = [];

    if (Dodo.NEXT_INDEX.value === -1) {
      throw new Error(
        "Before init you have to fetchAll dodos, fetchAll will set Next index"
      );
    }

    const seed = Dodo.BASE.seed({ seedKey: Dodo.NEXT_INDEX.value });
    const dodoPk = await Dodo.BASE.publicKeyFromSeed({
      seedKey: Dodo.NEXT_INDEX.value,
      walletPk,
      programId,
    });

    // create an empty account
    const emptyAccIns = await Dodo.BASE.createRentAccount({
      seed,
      walletPk,
      programId,
      connection,
      space: DODO_SIZE,
      newAccountPubkey: dodoPk,
    });

    instructions.push(emptyAccIns);

    const keys = [
      { pubkey: walletPk, isSigner: true, isWritable: true },
      { pubkey: dodoPk, isSigner: false, isWritable: true },
    ];

    // create initial data instruction
    const dataIns = Dodo.BASE.encodeDataIntoInstruction({
      tag: DODO_INSTRUCTIONS.CREATE,
      keys,
      schema: CREATE_DODO_SCHEMA,
      programPk: programId,
      data: {
        ...dodoData,
        title: fixedSizeStringArray(dodoData.title, 124),
        tagline: fixedSizeStringArray(dodoData.tagline, 24),
      },
    });

    instructions.push(dataIns);

    await Dodo.BASE.createTransaction({
      wallet,
      connection,
      instructions,
    });

    const createdDodo = await Dodo.fetch({
      dodoPk,
      walletPk,
      connection,
      programId,
    });

    if (createdDodo) {
      // update next index
      Dodo.NEXT_INDEX.value++;
    }

    return createdDodo;
  }

  static async update(ins: {
    wallet: BaseSignerWalletAdapter;
    connection: Connection;
    programId: PublicKey;
    dodoData: Pick<DodoData, "state"> & Pick<DodoData, "update_time">;
    dodoPk: PublicKey;
  }) {
    const { wallet, connection, programId, dodoData, dodoPk } = ins;

    const walletPk = wallet.publicKey;
    if (!walletPk) {
      throw new Error("The wallet does not have a public key");
    }

    const instructions: TransactionInstruction[] = [];
    const keys = [
      { pubkey: walletPk, isSigner: true, isWritable: true },
      { pubkey: dodoPk, isSigner: false, isWritable: true },
    ];

    // create data instruction
    const dataIns = Dodo.BASE.encodeDataIntoInstruction({
      tag: DODO_INSTRUCTIONS.UPDATE,
      keys,
      schema: UPDATE_DODO_SCHEMA,
      programPk: programId,
      data: dodoData,
    });

    instructions.push(dataIns);

    await Dodo.BASE.createTransaction({
      wallet,
      connection,
      instructions,
    });

    return Dodo.fetch({
      dodoPk,
      walletPk,
      connection,
      programId,
    });
  }

  static async remove(ins: {
    wallet: BaseSignerWalletAdapter;
    connection: Connection;
    programId: PublicKey;
    dodoPk: PublicKey;
  }) {
    const { wallet, connection, programId, dodoPk } = ins;

    const walletPk = wallet.publicKey;
    if (!walletPk) {
      throw new Error("The wallet does not have a public key");
    }

    const instructions: TransactionInstruction[] = [];
    const keys = [
      { pubkey: walletPk, isSigner: true, isWritable: true },
      { pubkey: dodoPk, isSigner: false, isWritable: true },
    ];

    // remove dodo instruction
    const dataIns = Dodo.BASE.encodeDataIntoInstruction({
      keys,
      programPk: programId,
      tag: DODO_INSTRUCTIONS.REMOVE,
    });

    instructions.push(dataIns);

    await Dodo.BASE.createTransaction({
      wallet,
      connection,
      instructions,
    });

    const removedDodo = await Dodo.fetch({
      dodoPk,
      walletPk,
      connection,
      programId,
    });

    if (!removedDodo) {
      // update next index
      Dodo.NEXT_INDEX.value--;
    }

    return removedDodo;
  }
}
