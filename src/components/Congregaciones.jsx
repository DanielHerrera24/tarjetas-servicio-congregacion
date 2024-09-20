import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Importa un ícono de flecha hacia atrás
import { useAuth } from "../context/AuthContext";

function Congregaciones() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="flex flex-col gap-4 px-10">
      <button
        onClick={() => navigate(-1)}
        className="block absolute top-0 left-0 bg-transparent text-black hover:text-blue-700"
      >
        <FaArrowLeft size={24} /> {/* Flecha hacia atrás */}
      </button>
      <h2 className="text-2xl font-semibold text-center">Congregaciones</h2>
      {user && user.uid === "eMhSeCCoZLUzrjxCdc7Ylfcu6SB2" && (
        <div className="flex gap-4 justify-center">
          <Link
            to="/grupos/sur"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-32"
          >
            Sur
          </Link>
        </div>
      )}
      {user && user.uid === "t1CsG4nesTO4wrnz7z4e4oh7rT13" && (
        <div className="flex gap-4 justify-center">
          <Link
            to="/grupos/primavera"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-32"
          >
            Primavera
          </Link>
        </div>
      )}
      {user && user.uid === "Jn2BVXqKHOaXPxYmtibEOwwZywP2" && (
        <div className="flex gap-4 justify-center">
          <Link
            to="/grupos/libertad"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-32"
          >
            Libertad
          </Link>
        </div>
      )}
    </section>
  );
}

export default Congregaciones;
