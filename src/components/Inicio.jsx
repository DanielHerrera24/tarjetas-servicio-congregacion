import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SyncLoader } from "react-spinners";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";

function Inicio() {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) return <SyncLoader color="#3B82F6" />;

  return (
    <>
      <div className="bg-white rounded-lg sm:shadow-xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          ¡Bienvenido, {user?.email || "Usuario"}!
        </h1>
        <p className="text-black mb-6">
          En esta aplicación podrás gestionar las tarjetas de servicio de tu congregación de manera fácil y rápida.
        </p>

        <div className="flex flex-col space-y-4">
          {/* Botón de congregaciones */}
          {user?.uid === "5wyoaagTbJOyE6ybQlxjH5Ue8tX2" ? (
            <>
              {/* Enlaces para el usuario con acceso total */}
              <Link
                to="/grupos/sur"
                className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
              >
                <FaUsers className="text-white" />
                <span>Sur</span>
              </Link>
              <Link
                to="/grupos/primavera"
                className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
              >
                <FaUsers className="text-white" />
                <span>Primavera</span>
              </Link>
              <Link
                to="/grupos/libertad"
                className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
              >
                <FaUsers className="text-white" />
                <span>Libertad</span>
              </Link>
            </>
          ) : (
            // Enlaces específicos para otros usuarios
            <>
              {user?.uid === "eMhSeCCoZLUzrjxCdc7Ylfcu6SB2" && (
                <Link
                  to="/grupos/sur"
                  className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
                >
                  <FaUsers className="text-white" />
                  <span>Congregación Sur</span>
                </Link>
              )}
              {user?.uid === "t1CsG4nesTO4wrnz7z4e4oh7rT13" && (
                <Link
                  to="/grupos/primavera"
                  className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
                >
                  <FaUsers className="text-white" />
                  <span>Congregación Primavera</span>
                </Link>
              )}
              {user?.uid === "Jn2BVXqKHOaXPxYmtibEOwwZywP2" && (
                <Link
                  to="/grupos/libertad"
                  className="bg-green-500 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded shadow-lg flex items-center justify-center space-x-2 transition-colors duration-300"
                >
                  <FaUsers className="text-white" />
                  <span>Congregación Libertad</span>
                </Link>
              )}
            </>
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
          <p>Puedes crear, ver, editar, guardar, mover de grupo, eliminar y descargar en PDF las tarjetas de servicio de cada grupo.</p>
          <p className="mt-2 text-blue-500">¡Organiza tu congregación con facilidad!</p>
        </div>
      </div>
    </>
  );
}

export default Inicio;
