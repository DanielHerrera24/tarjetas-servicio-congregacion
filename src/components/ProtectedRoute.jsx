/* eslint-disable react/prop-types */
import { SyncLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <SyncLoader color="#3B82F6" />;

  if (!user) return <Navigate to="/login" />;

  if (
    user.uid === "eMhSeCCoZLUzrjxCdc7Ylfcu6SB2" ||
    user.uid === "t1CsG4nesTO4wrnz7z4e4oh7rT13" ||
    user.uid === "Jn2BVXqKHOaXPxYmtibEOwwZywP2" ||
    user.uid === "5wyoaagTbJOyE6ybQlxjH5Ue8tX2" ||
    user.uid === "F7mOwGdIT1UMmwumoRi1pzrybQI3"
  ) {
    return <>{children}</>;
  } else {
    return (
      <div className="flex flex-col items-center justify-center p-4 pb-36">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            No tienes acceso a esta sección.
          </h2>
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
