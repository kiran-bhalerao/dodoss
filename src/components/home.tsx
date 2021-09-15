import { FC } from "react";
import { useWallet } from "src/context/Wallet";

export const Home: FC = () => {
  const { balance, connect, wallet, disconnect } = useWallet();

  return (
    <main>
      <h1>Balance: {balance}</h1>
      {!wallet?.connected && <button onClick={connect}>connect</button>}
      {wallet?.connected && <button onClick={disconnect}>disconnect</button>}
    </main>
  );
};
