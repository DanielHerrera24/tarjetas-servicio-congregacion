import "./App.css";
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
import VistaPreviaTarjeta from "./components/VistaPreviaTarjeta";
import NombramientosHermanos from "./components/NombramientosHermanos";

function App() {
  return (
    <>
      <Nav />
      <main className="flex justify-center min-h-[80vh] pt-10">
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
                  path="/:congregacionId/grupos"
                  element={
                    <ProtectedRoute>
                      <Grupos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/:congregacionId/grupos/:grupoId"
                  element={
                    <ProtectedRoute>
                      <Personas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/:congregacionId/nombramiento/:tipo"
                  element={
                    <ProtectedRoute>
                      <NombramientosHermanos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/:congregacionId/grupos/:grupoId/vistaPrevia"
                  element={
                    <ProtectedRoute>
                      <VistaPrevia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/:congregacionId/grupos/:grupoId/:tarjetaSeleccionadaId"
                  element={
                    <ProtectedRoute>
                      <VistaPreviaTarjeta />
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
