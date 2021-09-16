import { Home } from "src/components/home";
import { ConnectionProvider } from "src/context/Connection";
import { DodosProvider } from "src/context/Dodos";
import { WalletProvider } from "src/context/Wallet";
import progConf from "src/program-config.json";

function App() {
  return (
    <ConnectionProvider url={progConf.network}>
      <WalletProvider>
        <DodosProvider>
          <Home />
        </DodosProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
