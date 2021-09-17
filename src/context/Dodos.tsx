import { PublicKey } from "@solana/web3.js";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection } from "src/context/Connection";
import { useWallet } from "src/context/Wallet";
import progConf from "src/program-config.json";
import { Dodo } from "src/program/dodo";

const APP_PROGRAM_KEY = new PublicKey(progConf.programId);

type IDodosContext = {
  dodos: Dodo[];
  reFetchAll: () => Promise<void>;
  createDodo: (
    data: Parameters<typeof Dodo.create>["0"]["dodoData"]
  ) => Promise<Dodo | undefined>;
  updateDodo: (
    dodoPk: PublicKey,
    data: Parameters<typeof Dodo.update>["0"]["dodoData"]
  ) => Promise<Dodo | undefined>;
};

// This context is interface(binding) between "dodos program's js client" and react.js
// what is dodos program's js client?
// basically "dodos program's js client" is framework agnostic abstract code

const DodosContext = createContext<IDodosContext>({
  dodos: [],
  reFetchAll: async () => {},
  createDodo: async () => undefined,
  updateDodo: async () => undefined,
});

export const useDodos = () => {
  const context = useContext(DodosContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside DodosProvider");
  }

  return context;
};

export const DodosProvider: FC = ({ children }) => {
  const [dodos, setDodos] = useState<Dodo[]>([]);

  const { wallet } = useWallet();
  const { connection } = useConnection();

  const reFetchAll = useCallback(async () => {
    if (wallet?.publicKey) {
      const dodos = await Dodo.fetchAll(
        connection,
        wallet.publicKey,
        APP_PROGRAM_KEY
      );

      setDodos(dodos);
    }
  }, [connection, wallet?.publicKey]);

  const createDodo = useCallback(
    async (data: Parameters<typeof Dodo.create>["0"]["dodoData"]) => {
      if (wallet) {
        const dodo = await Dodo.create({
          connection,
          wallet,
          programId: APP_PROGRAM_KEY,
          dodoData: data,
        });

        if (dodo) {
          setDodos((dodos) => [...dodos, dodo]);
          return dodo;
        }
      }
    },
    [connection, wallet]
  );

  const updateDodo = useCallback(
    async (
      dodoPk: PublicKey,
      data: Parameters<typeof Dodo.update>["0"]["dodoData"]
    ) => {
      if (wallet) {
        const dodo = await Dodo.update({
          connection,
          wallet,
          programId: APP_PROGRAM_KEY,
          dodoPk,
          dodoData: data,
        });

        if (dodo) {
          setDodos((dodos) =>
            dodos.map((D) => {
              if (D.publicKey.toString() === dodo.publicKey.toString()) {
                return dodo;
              }

              return D;
            })
          );

          return dodo;
        }
      }
    },
    [connection, wallet]
  );

  useEffect(() => {
    reFetchAll();
  }, [reFetchAll]);

  return (
    <DodosContext.Provider
      value={{ dodos, reFetchAll, createDodo, updateDodo }}
    >
      {children}
    </DodosContext.Provider>
  );
};
