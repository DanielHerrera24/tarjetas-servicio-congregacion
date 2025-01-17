import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Importa un ícono de flecha hacia atrás
import { FaMoon, FaSun } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";

function Nav() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation(); // Obtenemos la ubicación actual

  const hideBackButton =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/olvidaste-tu-contrasena";

  return (
    <header className="w-full fixed top-0 left-0 sm:shadow-md z-10">
      <nav
        className={`md:px-0 py-2 px-0 flex md:flex md:items-center justify-between md:justify-between ${
          darkMode ? "sm:bg-gray-800" : "sm:bg-gray-200"
        }`}
      >
        <div className="flex items-center">
          <Link
            to="/"
            className={`flex text-2xl items-center gap-1 ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <span className="ml-2 font-semibold hidden sm:block">
              Gestión de Congregación
            </span>
          </Link>
          {!hideBackButton && ( // Condición para mostrar la flecha
            <button
              onClick={() => navigate(-1)}
              className={`sm:hidden ml-2 sm:ml-4 border rounded-full p-3 shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-white text-red-500 hover:bg-gray-700"
                  : "bg-white border-black text-red-500 hover:bg-gray-100"
              } hover:scale-110`}
            >
              <FaArrowLeft size={24} />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <span className="hidden sm:inline mr-3">
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </span>
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 sm:p-2 mr-4 rounded-md border ${
              darkMode
                ? "border-white bg-gray-800 hover:bg-gray-700 text-white"
                : "border-black bg-white hover:bg-gray-100 text-black"
            }`}
          >
            {darkMode ? <FaSun color="white" size={20} /> : <FaMoon color="black" size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Nav;
