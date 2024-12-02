import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Configuración Firestore
import { useAuth } from "../context/AuthContext";
import { SyncLoader } from "react-spinners";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";

function Inicio() {
  const { user, logout, loading } = useAuth();
  const [congregacion, setCongregacion] = useState(null); // Almacena la congregación del usuario
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerCongregacion = async () => {
      if (user) {
        try {
          // Obtiene el documento del usuario en Firestore
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // Si el usuario tiene congregación asignada
            setCongregacion(docSnap.data().congregacion);
          } else {
            // Si no tiene una congregación asignada
            setError("No tienes una congregación asignada.");
          }
        } catch (e) {
          // Manejo de errores
          console.error("Error al obtener congregación:", e);
          setError("Ocurrió un error al cargar la congregación.");
        }
      }
    };

    // Ejecutar solo si hay un usuario autenticado
    if (user) {
      obtenerCongregacion();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <SyncLoader color="#3B82F6" />;

  // Capitalizar la primera letra de la congregación
  const congregacionCapitalizada = congregacion ? congregacion.charAt(0).toUpperCase() + congregacion.slice(1) : null;

  return (
    <div className="bg-white rounded-lg sm:shadow-xl p-6 max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        ¡Bienvenido!
      </h1>
      <p className="text-black mb-6">
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
      <div className="mt-8 text-black">
        <p>
          Puedes crear, ver, editar, guardar, mover de grupo, eliminar y
          descargar en PDF las tarjetas de servicio de tu congregación.
        </p>
        <p className="mt-2 text-blue-500">
          ¡Organiza tu congregación con facilidad!
        </p>
      </div>
    </div>
  );
}

export default Inicio;
