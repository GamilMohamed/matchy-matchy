import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { LoginForm } from "@/components/login-form"
import { Toaster } from "./components/ui/toaster";
import Welcome from './components/welcome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <main className="flex flex-col items-center justify-center h-screen">
              <LoginForm />
          </main>
        } />
        <Route path="/" element={
          <main className="flex flex-col items-center justify-center h-screen">
            <Welcome />
          </main>
        } />
      </Routes>
      <Toaster /> {/* Le Toaster est en dehors des Routes pour être disponible partout */}
    </Router>
  );
}

export default App;
