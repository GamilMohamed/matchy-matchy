import { LoginForm } from "@/components/login-form"
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-y-4">
        <LoginForm />
      </div>
    </main>
  );
}

export default App;
