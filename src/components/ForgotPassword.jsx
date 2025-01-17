import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

function ForgotPassword() {
  const { darkMode } = useDarkMode();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth(); // Asegúrate de que resetPassword esté disponible en tu AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await resetPassword(email);
      setMessage(
        "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña."
      );
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("Correo electrónico inválido.");
      } else if (error.code === "auth/user-not-found") {
        setError("No se encontró un usuario con este correo.");
      } else {
        setError("Error al intentar enviar el correo. Intenta nuevamente.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full max-w-md p-8 rounded shadow-lg ${
          darkMode
            ? "bg-[#303030] text-white shadow-gray-600"
            : "bg-[#f3f3f3] text-black"
        }`}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Recupera tu Contraseña
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block font-medium mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Enviar Instrucciones
          </button>
        </form>

        <div className="mt-4 text-left">
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 border-b border-blue-500"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
