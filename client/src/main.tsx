import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthProvider } from "./context/auth-context.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { ModeToggle } from "./components/mode-toggle.tsx";

export default App;

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>{" "}
  </ThemeProvider>
);
