import { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import {
  Connection,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export class ProgramTransaction {
  static async getErrorForTransaction(connection: Connection, txid: string) {
    const tx = await connection.getParsedConfirmedTransaction(
      txid,
      "confirmed"
    );

    const errors: string[] = [];
    if (tx?.meta && tx.meta.logMessages) {
      console.log(tx.meta.logMessages);
      for (const log of tx.meta.logMessages) {
        if (log.includes("already in use")) {
          errors.push("Account already in use!");
        }

        const regex = /Error: (.*)/gm;
        let m;
        while ((m = regex.exec(log)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          if (m.length > 1) {
            errors.push(m[1]);
          }
        }
      }
    }

    return errors;
  }

  static async createTransaction(ins: {
    connection: Connection;
    wallet: BaseSignerWalletAdapter;
    instructions?: TransactionInstruction[];
    awaitConfirmation?: boolean;
  }) {
    const {
      wallet,
      connection,
      instructions = [],
      awaitConfirmation = true,
    } = ins;

    const walletPk = wallet.publicKey;
    if (!walletPk) {
      throw new Error("The wallet does not have a public key");
    }

    let transaction = new Transaction({ feePayer: walletPk });
    for (const i of instructions) {
      transaction.add(i);
    }
    const recentBlock = await connection.getRecentBlockhash("max");
    transaction.recentBlockhash = recentBlock.blockhash;

    transaction = await wallet.signTransaction(transaction);
    const rawTransaction = transaction.serialize();

    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      preflightCommitment: "singleGossip",
    });

    if (awaitConfirmation) {
      try {
        const status = await connection.confirmTransaction(
          txid,
          "singleGossip"
        );

        if (status.value.err) {
          throw new Error("error");
        }
      } catch {
        const errors = await ProgramTransaction.getErrorForTransaction(
          connection,
          txid
        );
        console.error("Error executing transaction", errors);
      }
    }

    return txid;
  }
}
