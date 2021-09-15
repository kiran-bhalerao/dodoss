import type { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import type {
  AccountInfo,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { ProgramBase } from "src/program/lib/base";
import { Lock } from "src/program/lib/lock";

const DODO_SEED = "DODO";
const DODO_SIZE =
  140 * 4 + // title 140 chars
  500 * 4 + // content 500 chars
  1 + // state 1byte (0,1,2)
  4 + // create_time 4bytes (timestamp)
  4; // update_time 4bytes (timestamp)

const DODO_SCHEMA = [
  { key: "title", type: "[char;140]" },
  { key: "content", type: "[char;500]" },
  { key: "state", type: "u8" },
  { key: "create_time", type: "u32" },
  { key: "update_time", type: "u32" },
];

enum DODO_INSTRUCTIONS {
  CREATE,
  UPDATE,
}

export enum DODO_STATE {
  TODO,
  IN_PROGRESS,
  COMPLETED,
}

type DodoData = {
  title: string;
  content: string;
  state: DODO_STATE;
  create_time: number;
  update_time: number;
};

class DodoBase extends ProgramBase<DodoData> {
  seed(args: { seedKey: string | number }) {
    return `${DODO_SEED}__${args.seedKey}`;
  }

  decode(info: AccountInfo<Buffer>) {
    const { title, content, state, create_time, update_time } =
      super.decodeInfo(info, DODO_SCHEMA);

    return {
      title: super.decodeStr(title),
      content: super.decodeStr(content),
      state: Number(state),
      create_time: Number(create_time),
      update_time: Number(update_time),
    };
  }
}

export class Dodo {
  private static BASE = new DodoBase();
  private static STARTING_INDEX = 0; // now worry, these indexes are user specific
  private static NEXT_INDEX = new Lock(-1);

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
      if (!index) {
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

  static async createOrUpdate(ins: {
    wallet: BaseSignerWalletAdapter;
    connection: Connection;
    programId: PublicKey;
    dodoData?: DodoData;
    dodoPk?: PublicKey;
  }) {
    let { dodoPk } = ins;
    const { wallet, connection, programId, dodoData } = ins;

    const walletPk = wallet.publicKey;
    if (!walletPk) {
      throw new Error("The wallet does not have a public key");
    }

    let tag = DODO_INSTRUCTIONS.UPDATE;
    const instructions: TransactionInstruction[] = [];

    if (!dodoPk) {
      if (Dodo.NEXT_INDEX.value === -1) {
        throw new Error(
          "Before init you have to fetchAll dodos, fetchAll will set Next index"
        );
      }

      const seed = Dodo.BASE.seed({ seedKey: Dodo.NEXT_INDEX.value });
      dodoPk = await Dodo.BASE.publicKeyFromSeed({
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

      tag = DODO_INSTRUCTIONS.CREATE;
      instructions.push(emptyAccIns);
    }

    if (dodoData) {
      const keys = [
        { pubkey: walletPk, isSigner: true, isWritable: true },
        { pubkey: dodoPk, isSigner: false, isWritable: true },
      ];

      // create initial data instruction
      const dataIns = Dodo.BASE.encodeDataIntoInstruction({
        tag,
        keys,
        schema: DODO_SCHEMA,
        programPk: programId,
        data: dodoData,
      });

      instructions.push(dataIns);
    }

    await Dodo.BASE.createTransaction({
      wallet,
      connection,
      instructions,
    });

    if (tag === DODO_INSTRUCTIONS.CREATE) {
      // update next index
      Dodo.NEXT_INDEX.value++;
    }

    return Dodo.fetch({
      dodoPk,
      walletPk,
      connection,
      programId,
    });
  }
}