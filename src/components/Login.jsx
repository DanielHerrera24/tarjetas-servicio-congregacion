import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(user.email, user.password);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("El correo ya está en uso.");
      } else if (error.code === "auth/invalid-email") {
        setError("Correo electrónico inválido.");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil.");
      } else if (error.code === "auth/user-not-found") {
        setError("No se encontró un usuario con este correo.");
      } else if (error.code === "auth/wrong-password") {
        setError("La contraseña es incorrecta.");
      } else if (error.code === "auth/operation-not-allowed") {
        setError("El inicio de sesión no está permitido en este momento.");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde."
        );
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setError(
          "Ya existe una cuenta con el mismo correo, pero con otro proveedor de autenticación."
        );
      } else if (error.code === "auth/auth-domain-config-required") {
        setError("La configuración del dominio de autenticación es necesaria.");
      } else if (error.code === "auth/credential-already-in-use") {
        setError("Las credenciales ya están en uso.");
      } else if (error.code === "auth/invalid-action-code") {
        setError("Código de acción inválido.");
      } else if (error.code === "auth/invalid-api-key") {
        setError("Clave API inválida.");
      } else if (error.code === "auth/invalid-user-token") {
        setError("Token de usuario inválido.");
      } else if (error.code === "auth/expired-action-code") {
        setError("Código de acción expirado.");
      } else if (error.code === "auth/user-disabled") {
        setError("La cuenta de usuario está deshabilitada.");
      } else if (error.code === "auth/invalid-credential") {
        setError("El correo o la contraseña son incorrectos.");
      } else if (error.code === "auth/missing-password") {
        setError("Ingresa la contraseña.");
      } else {
        setError("Error desconocido: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 pb-32">
      <h2 className="text-3xl font-bold text-black mb-6 text-center">
        Gestión de Congregación
      </h2>
      <div className="relative bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Inicia Sesión
        </h2>
        <div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 w-full"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
