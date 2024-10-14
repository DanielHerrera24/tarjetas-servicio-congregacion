import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Importa un ícono de flecha hacia atrás

function Nav() {
  const navigate = useNavigate();
  const location = useLocation(); // Obtenemos la ubicación actual

  const hideBackButton = location.pathname === "/" || location.pathname === "/login";

  return (
    <header className="w-full fixed top-0 left-0 sm:shadow-md z-10">
      <nav className="md:px-0 py-2 px-0 flex md:flex md:items-center justify-between md:justify-between sm:bg-gray-200">
        <div className="flex items-center">
          <Link to="/" className="flex text-2xl items-center gap-1">
            <span className="ml-2 font-semibold hidden sm:block">
              Tarjetas de Servicio
            </span>
          </Link>
          {!hideBackButton && ( // Condición para mostrar la flecha
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden ml-2 sm:ml-4 bg-white shadow-lg border border-black rounded-full p-3 text-red-500 hover:bg-gray-100 hover:scale-110"
            >
              <FaArrowLeft size={24} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Nav;
