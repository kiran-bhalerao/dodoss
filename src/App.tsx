import { ConnectionProvider } from "src/context/Connection";
import { DodosProvider } from "src/context/Dodos";
import { WalletProvider } from "src/context/Wallet";
import progConf from "src/program-config.json";
import { Router } from "src/router";

function App() {
  return (
    <ConnectionProvider url={progConf.network}>
      <WalletProvider>
        <DodosProvider>
          <Router />
        </DodosProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
