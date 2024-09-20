import "./App.css";
import Congregaciones from "./components/Congregaciones";
import Nav from "./components/Nav";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Grupos from "./components/Grupos";
import Personas from "./components/Personas";
import VistaPrevia from "./components/VistaPrevia";

function App() {
  return (
    <>
      <Nav />
      <main className="flex justify-center min-h-[80vh] pt-16">
        <div className="flex flex-col md:mt-7 w-full max-w-screen-lg">
          <section
            id="seccion"
            className="relative flex flex-col items-center w-full h-auto text-black"
          >
            <AuthProvider>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Inicio />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/congregaciones"
                  element={
                    <ProtectedRoute>
                      <Congregaciones />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grupos/:congregacionId"
                  element={
                    <ProtectedRoute>
                      <Grupos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grupos/:congregacionId/:grupoId"
                  element={
                    <ProtectedRoute>
                      <Personas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grupos/:congregacionId/:grupoId/vistaPrevia"
                  element={
                    <ProtectedRoute>
                      <VistaPrevia />
                    </ProtectedRoute>
                  }
                />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </AuthProvider>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
