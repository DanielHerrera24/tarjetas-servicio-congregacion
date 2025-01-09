import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SyncLoader } from "react-spinners";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de importar tu configuración de Firestore

function Inicio() {
  const { user, logout, role, loading } = useAuth();
  const [congregacion, setCongregacion] = useState(null); // Almacena la congregación del usuario
  const [usuarioDatos, setUsuarioDatos] = useState(null); // Almacena la información del usuario (nombre, etc.)
  const [error, setError] = useState(null);
  const [usuarioTieneAcceso, setUsuarioTieneAcceso] = useState(null); // Estado para verificar acceso
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const obtenerCustomClaims = async () => {
      if (user) {
        try {
          // Obtener el token del usuario para acceder a los custom claims
          const idTokenResult = await user.getIdTokenResult(true); // true para forzar la actualización del token
          const claims = idTokenResult.claims;

          // Verificar si el usuario tiene un custom claim de 'congregacionId'
          if (claims.congregacionId) {
            setCongregacion(claims.congregacionId); // Si tiene un custom claim, se asigna la congregación
            setUsuarioTieneAcceso(true);
          } else {
            // Si no tiene el custom claim, se indica que no tiene acceso
            setUsuarioTieneAcceso(false);
          }

          // Obtener los datos adicionales del usuario desde Firestore
          const usuarioRef = doc(db, "usuarios", user.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);
          if (usuarioSnapshot.exists()) {
            setUsuarioDatos(usuarioSnapshot.data());
            console.log(user); // Almacena los datos del usuario (nombre, etc.)
          } else {
            console.log("No se encontraron datos del usuario.");
          }
        } catch (e) {
          console.error(
            "Error al obtener custom claims o datos de usuario:",
            e
          );
          setError("Ocurrió un error al verificar tu acceso.");
          setUsuarioTieneAcceso(false);
        }
      }
    };

    // Ejecutar solo si hay un usuario autenticado
    if (user) {
      obtenerCustomClaims();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <SyncLoader color="#3B82F6" />;

  // Capitalizar la primera letra de la congregación
  const congregacionCapitalizada = congregacion
    ? congregacion.charAt(0).toUpperCase() + congregacion.slice(1)
    : null;

  if (usuarioTieneAcceso === null) {
    return (
      <div className="flex justify-center items-center p-4">
        <SyncLoader color="#3B82F6" />
      </div>
    );
  }

  // Mostrar mensaje si el usuario no tiene acceso
  if (usuarioTieneAcceso === false) {
    return (
      <div
        className={`rounded-lg shadow-xl p-6 max-w-md w-full text-center ${
          darkMode
            ? "bg-[#303030] text-white shadow-gray-600"
            : "bg-[#f3f3f3] text-black"
        }`}
      >
        <p className={`text-lg mb-4 ${darkMode ? "text-white" : "text-black"}`}>
          No tienes acceso a esta aplicación. Por favor, contacta a tu
          supervisor para que se te otorgue acceso.
        </p>
        <p className={`text-lg mb-4 ${darkMode ? "text-white" : "text-black"}`}>
          Si te haz registrado avisa a tu supervisor para que te brinde acceso.
        </p>
        <p className={`text-lg mb-4 ${darkMode ? "text-white" : "text-black"}`}>
          Recarga la página o vuelve a iniciar sesión si es necesario.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-800 text-white font-bold py-3 px-6 rounded w-full transition-colors duration-100 flex items-center justify-center space-x-2"
        >
          <FaSignOutAlt className="text-white" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-xl p-6 max-w-md w-full text-center ${
        darkMode
          ? "bg-[#303030] text-white shadow-gray-600"
          : "bg-[#f3f3f3] text-black"
      }`}
    >
      <h1 className="text-2xl font-bold text-blue-500 mb-1">
        ¡Bienvenido{" "}
        <span className={`${darkMode ? "text-white" : "text-black"}`}>
          {usuarioDatos ? usuarioDatos.nombre : ""}
        </span>
        !
      </h1>
      <h2 className="text-xl font-bold text-blue-500 mb-4">
        Rol:{" "}
        <span className={`${darkMode ? "text-white" : "text-black"}`}>
          {role}
        </span>
      </h2>
      <p className="mb-6">
        En esta aplicación podrás gestionar las tarjetas de servicio de tu
        congregación de manera fácil y rápida.
      </p>

      <div className="flex flex-col space-y-4">
        {/* Mostrar el botón si hay una congregación asignada */}
        {congregacion ? (
          <Link
            to={`/${congregacion}/grupos`}
            className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
          >
            <FaUsers className="text-white" />
            <span>Congregación {congregacionCapitalizada}</span>
          </Link>
        ) : (
          // Mostrar error si no tiene congregación asignada
          <p className="text-red-500">
            {error || "No tienes acceso asignado."}
          </p>
        )}
        {role === "Administrador" && (
          <Link
            to={`/${congregacion}/accesos`}
            className="bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
          >
            <span>Accesos</span>
          </Link>
        )}

        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded w-full transition-colors duration-300 flex items-center justify-center space-x-2"
        >
          <FaSignOutAlt className="text-white" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-8">
        <p>
          Puedes crear, ver, editar, guardar, mover de grupo, eliminar y
          descargar en PDF las tarjetas de servicio de tu congregación.
        </p>
        <p className="font-semibold mt-2 text-blue-500">
          ¡Organiza tu congregación con facilidad!
        </p>
      </div>
    </div>
  );
}

export default Inicio;
