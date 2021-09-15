import { Home } from "src/components/home";
import { ConnectionProvider } from "src/context/Connection";
import { DodosProvider } from "src/context/Dodos";
import { WalletProvider } from "src/context/Wallet";

function App() {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <DodosProvider>
          <Home />
        </DodosProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
