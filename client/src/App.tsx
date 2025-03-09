import { BrowserRouter as Router, Route, Routes } from "react-router";
import { LoginForm } from "@/components/login-form";
import Home from "./components/home";
import Test from "./components/test";
import About from "./components/about-us";
import Settings from "./components/settings";
import Profil from "./components/profil";
import UserPage from "./components/UserPage";
import PreferencesForms from "./components/PrefForms";
import Error from "./components/Error";
import { useAuth } from "./context/auth-context";
import Nav from "./components/Nav";

function App() {
  const { user, profileCompleted, loading } = useAuth();
  const isAuth = !!user;
  console.log("isAuth", isAuth, user);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuth) {
    return (
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              <main className="flex flex-col items-center justify-center h-screen">
                <LoginForm />
              </main>
            }
          />
        </Routes>
      </Router>
    );
  }

  if (isAuth && user && !profileCompleted && user.profileComplete === false) {
    return (
      <Router>
        <Routes>
          <Route
            path="*"
            element={
              <main className="flex flex-col items-center justify-center h-screen">
                <PreferencesForms />
              </main>
            }
          />
        </Routes>
      </Router>
    );
  }
 

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <Home />
            </main>
          }
        />
        <Route
          path="/test"
          element={
            <>
            <Nav />
              <Test />
            </>
          }
        />
        <Route
          path="/about-us"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <About />
            </main>
          }
        />
        <Route
          path="/settings"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <Settings />
            </main>
          }
        />
        <Route
          path="/profil"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <Profil />
            </main>
          }
        />
        <Route
          path="/user/:username"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <UserPage />
            </main>
          }
        />
        <Route
          path="/*"
          element={
            <main className="flex flex-col items-center justify-center h-screen">
              <Error />
            </main>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
