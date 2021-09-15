import { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection } from "src/context/Connection";
import { ProgramUtils } from "src/program/lib/util";

type WalletContextType = {
  balance: number;
  wallet: BaseSignerWalletAdapter | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchBalance: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  balance: 0,
  connect: async () => {},
  disconnect: async () => {},
  fetchBalance: async () => {},
});

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside WalletProvider");
  }

  return context;
};

export const WalletProvider: FC = ({ children }) => {
  const [wallet, setWallet] = useState<BaseSignerWalletAdapter | null>(null);
  const [balance, setBalance] = useState(0);

  // hack to trigger re-render WalletProvider
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const { connection } = useConnection();

  const connect = useCallback(async () => {
    if (wallet) {
      await wallet.connect();
      forceUpdate();
    }
  }, [forceUpdate, wallet]);

  const disconnect = useCallback(async () => {
    if (wallet) {
      await wallet.disconnect();
      forceUpdate();
    }
  }, [forceUpdate, wallet]);

  const fetchBalance = useCallback(async () => {
    if (wallet?.publicKey) {
      const balance = await connection.getBalance(wallet.publicKey);
      setBalance(ProgramUtils.lamportsToSol(balance || 0));
    }
  }, [connection, wallet?.publicKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const wallet = new PhantomWalletAdapter();
    setWallet(wallet);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        balance,
        fetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
