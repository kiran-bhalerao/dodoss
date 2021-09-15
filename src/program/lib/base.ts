import type { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import {
  AccountInfo,
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import soproxABI from "soprox-abi";
import { ProgramTransaction } from "src/program/lib/transaction";

type Schema = { key: string; type: string }[];

export abstract class ProgramBase<K> {
  abstract seed(args: { seedKey: number | string }): string;
  abstract decode(info: AccountInfo<Buffer>): K;

  public async publicKeyFromSeed(
    ins: {
      walletPk: PublicKey;
      programId: PublicKey;
    } & Parameters<ProgramBase<K>["seed"]>["0"]
  ) {
    const { walletPk, programId, seedKey } = ins;
    const seed = this.seed({ seedKey });
    const publicKey = await PublicKey.createWithSeed(walletPk, seed, programId);
    return publicKey;
  }

  public decodeStr(str: string) {
    return str
      .split("")
      .filter((c) => c.charCodeAt(0) !== 0)
      .map((c) => c.replace(/\0/g, ""))
      .join("");
  }

  public decodeInfo(info: AccountInfo<Buffer>, schema: Schema): K {
    const buffer = Buffer.from(info.data);
    const layout = new soproxABI.struct(schema);
    layout.fromBuffer(buffer);

    return layout.value;
  }

  public encodeDataIntoInstruction<Z = { [P in keyof K]?: unknown }>(ins: {
    tag: number;
    schema: Schema;
    keys: AccountMeta[];
    programPk: PublicKey;
    data: Z;
  }) {
    const { data, tag, keys, schema, programPk } = ins;
    const tagData = new soproxABI.u8(tag);
    const restData = new soproxABI.struct(schema, data);
    const bufferData = soproxABI.pack(tagData, restData);

    return new TransactionInstruction({
      keys,
      data: bufferData,
      programId: programPk,
    });
  }

  public async createRentAccount(ins: {
    seed: string;
    space: number;
    walletPk: PublicKey;
    programId: PublicKey;
    connection: Connection;
    newAccountPubkey: PublicKey;
    initialLamports?: number;
  }) {
    const {
      connection,
      programId,
      walletPk,
      newAccountPubkey,
      space,
      seed,
      initialLamports = 0,
    } = ins;

    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    const instruction = SystemProgram.createAccountWithSeed({
      space,
      seed,
      lamports: lamports + initialLamports,
      programId,
      newAccountPubkey,
      fromPubkey: walletPk,
      basePubkey: walletPk,
    });

    return instruction;
  }

  public async createTransaction(ins: {
    connection: Connection;
    wallet: BaseSignerWalletAdapter;
    instructions?: TransactionInstruction[];
    awaitConfirmation?: boolean;
  }) {
    return ProgramTransaction.createTransaction(ins);
  }
}
