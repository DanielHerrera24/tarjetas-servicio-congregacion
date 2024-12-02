/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Configuración Firestore

export function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const fetchAllowedUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        const users = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Data del documento:", data); // Verificar datos del documento
          return data.uid; // Asegúrate de que 'uid' exista
        });
        setAllowedUsers(users);
        console.log("Usuarios permitidos:", users);
      } catch (e) {
        console.error("Error al obtener usuarios permitidos:", e);
        setError("Ocurrió un error al verificar el acceso.");
      }
    };

    fetchAllowedUsers();
  }, []);

  if (loading) return <SyncLoader color="#3B82F6" />;

  if (!user) return <Navigate to="/login" />;

  if (allowedUsers.includes(user.uid)) {
    return <>{children}</>;
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-4 pb-36">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            No tienes acceso a esta sección.
          </h2>
          {error && <p>{error}</p>}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 w-full"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }
}
