import "./App.css";
import Nav from "./components/Nav";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Grupos from "./components/Grupos";
import Personas from "./components/Personas";
import VistaPrevia from "./components/VistaPrevia";
import VistaPreviaTarjeta from "./components/VistaPreviaTarjeta";
import NombramientosHermanos from "./components/NombramientosHermanos";
import { useDarkMode } from "./context/DarkModeContext";
import Accesos from "./components/Accesos";
import { useState } from "react";
import Footer from "./components/Footer";

function App() {
  const { darkMode } = useDarkMode();
  const { user } = useAuth(); // Obtener el usuario autenticado
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
      <Nav />
      <main
        className={`flex justify-center min-h-[100vh] pt-14 ${
          darkMode ? "bg-[#1F1F1F] text-white" : "bg-white text-black"
        }`}
      >
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
                  path="/:congregacionId/accesos"
                  element={
                    <ProtectedRoute>
                      <Accesos />
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

      {/* Footer solo si el usuario está autenticado */}
      {user && <Footer onOpenPrivacyModal={() => setShowPrivacyModal(true)} />}

      {/* Modal del Aviso de Privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg max-w-md w-full border ${
              darkMode
                ? "bg-[#303030] text-white border-white"
                : "bg-white text-black border-black"
            } overflow-y-auto max-h-[70vh]`}
          >
            <h3 className="text-lg font-bold mb-4">Aviso de Privacidad</h3>
            <p className="text-sm mb-4">
              Este Aviso de Privacidad describe cómo recopilamos, utilizamos y
              protegemos tus datos personales. Al registrarte en nuestra
              aplicación, aceptas los términos descritos a continuación:
            </p>
            <ul className="text-sm text-left mb-4 list-disc pl-6 flex flex-col gap-3">
              <li>
                <strong>Datos que recopilamos:</strong> nombre, correo
                electrónico, contraseña y nombre de la congregación.
              </li>
              <li>
                <strong>Propósito de la recopilación:</strong> proporcionar
                acceso a la aplicación y permitirte acceder a la información de
                tu congregación correspondiente.
              </li>
              <li>
                <strong>Compartimos datos con:</strong> Firebase (para
                almacenamiento y autenticación) y EmailJs (para notificaciones y
                correos electrónicos).
              </li>
              <li>
                <strong>Almacenamiento:</strong> Los datos se guardan en
                servidores seguros de Firebase con acceso restringido y
                protegidos mediante reglas avanzadas de seguridad.
              </li>
              <li>
                <strong>Derechos del usuario:</strong> Puedes solicitar acceso a
                tus datos en cualquier momento.
              </li>
              <li>
                <strong>Consentimiento obligatorio:</strong> Proporcionar los
                datos mencionados es necesario para acceder a la aplicación. Sin
                esta información, no se podrá otorgar acceso.
              </li>
              <li>
                <strong>Retención de datos:</strong> Los datos se almacenan
                hasta que decidas eliminar tu cuenta.
              </li>
              <li>
                <strong>Alcance geográfico:</strong> Este Aviso de Privacidad se
                aplica exclusivamente a usuarios en México.
              </li>
            </ul>
            <p className="text-sm mb-4">
              Si tienes preguntas o deseas más información, contacta a tu
              supervisor.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
