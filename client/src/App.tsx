import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { LoginForm } from "@/components/login-form"
import { Toaster } from "./components/ui/toaster";
import Home from './components/home';
import About from './components/about-us';
import Settings from './components/settings';
import Profil from './components/profil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <main className="flex flex-col items-center justify-center h-screen">
              <LoginForm />
          </main>
        } />
        <Route path="/home" element={
          <main className="flex flex-col items-center justify-center h-screen">
            <Home />
          </main>
        } />
        <Route path="/about-us" element={
          <main className="flex flex-col items-center justify-center h-screen">
              <About />
          </main>
        } />
        <Route path="/settings" element={
          <main className="flex flex-col items-center justify-center h-screen">
              <Settings />
          </main>
        } />
        <Route path="/profil" element={
          <main className="flex flex-col items-center justify-center h-screen">
              <Profil />
          </main>
        } />
      </Routes>
      <Toaster /> {/* Le Toaster est en dehors des Routes pour être disponible partout */}
    </Router>
  );
}

export default App;
