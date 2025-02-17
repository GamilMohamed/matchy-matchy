import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { Toaster } from "./components/ui/toaster.tsx";
import { AuthContextProvider } from "./context/auth-context.tsx";

createRoot(document.getElementById("root")!).render(
  <AuthContextProvider>
    <App />
    <Toaster />
  </AuthContextProvider>
);
