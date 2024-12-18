/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db } from "../firebase"; // Importar Firestore
import { doc, setDoc } from "firebase/firestore";
import { useDarkMode } from "../context/DarkModeContext";

function Register() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    congregacion: "",
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode } = useDarkMode();

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
      const name = user.name
      // Crear el usuario con email y password
      const userCredential = await signup(user.email, user.password);
      const uid = userCredential.user.uid;

      // Si la congregación es 'otra', usar el valor de otraCongregacion
      const congregacionFinal =
        user.congregacion === "otra"
          ? user.otraCongregacion
          : user.congregacion;

      // Guardar información adicional en Firestore
      await setDoc(doc(db, "usuarios", uid), {
        nombre: name,
        uid: uid, // Asegúrate de usar el uid obtenido de userCredential
        email: user.email,
        congregacion: congregacionFinal, // Guardar la congregación correctamente
      });

      navigate("/");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("El correo ya está en uso.");
          break;
        case "auth/invalid-email":
          setError("Correo electrónico inválido.");
          break;
        case "auth/weak-password":
          setError("La contraseña es demasiado débil.");
          break;
        default:
          setError("Error desconocido: " + error.message);
      }
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        darkMode ? "bg-[#1F1F1F] text-white" : "bg-white text-black"
      }`}
    >
      <h2 className="sm:hidden text-3xl font-bold mb-6 text-center">
        Gestión de Congregación
      </h2>
      <div
        className={`shadow-2xl rounded-lg p-8 max-w-md w-full ${
          darkMode
            ? "bg-[#303030] text-white shadow-gray-600"
            : "bg-[#f3f3f3] text-black"
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Regístrate</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          {/* Campo de nombre */}
          <div>
            <label htmlFor="name" className="block font-medium">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={handleChange}
              className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Campo de correo */}
          <div>
            <label htmlFor="email" className="block font-medium">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Campo de contraseña */}
          <div className="relative">
            <label htmlFor="password" className="block font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                onChange={handleChange}
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-black"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Selector de congregación */}
          <div>
            <label htmlFor="congregacion" className="block font-medium">
              Selecciona tu congregación
            </label>
            <select
              id="congregacion"
              name="congregacion"
              value={user.congregacion}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value === "otra") {
                  setUser({
                    ...user,
                    congregacion: "otra",
                    otraCongregacion: "",
                  }); // Inicializa "otraCongregacion"
                }
              }}
              className="text-black mt-1 block w-full px-3 py-2 mb-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="" disabled>
                -- Selecciona una congregación --
              </option>
              <option value="sur">Congregación Sur</option>
              <option value="primavera">Congregación Primavera</option>
              <option value="libertad">Congregación Libertad</option>
              <option value="otra">Otra Congregación</option>
            </select>

            {/* Campo adicional para "Otra Congregación" */}
            {user.congregacion === "otra" && (
              <div className="mt-2">
                <label
                  htmlFor="otra-congregacion"
                  className="block font-medium"
                >
                  Escribe el nombre de tu congregación (minúsculas)
                </label>
                <input
                  type="text"
                  id="otra-congregacion"
                  name="otraCongregacion"
                  placeholder="sur"
                  value={user.otraCongregacion || ""} // Maneja el valor de "otraCongregacion"
                  onChange={(e) =>
                    setUser({
                      ...user,
                      otraCongregacion: e.target.value.toLowerCase(),
                    })
                  }
                  className="text-black mt-1 mb-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            )}
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Registrar
          </button>
        </form>
        <div className="pt-4 flex justify-between gap-2">
          <span>¿Ya tienes una cuenta?</span>
          <Link
            to="/login"
            className="text-blue-500 border-b border-blue-400 hover:text-blue-700 hover:border-blue-700"
          >
            Inicia Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
