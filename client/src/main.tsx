import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthProvider } from "./context/auth-context.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { SocketProvider } from "./context/socket-context.tsx";

export default App;

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <SocketProvider>
        <App />
        <Toaster />
      </SocketProvider>
    </AuthProvider>
);
