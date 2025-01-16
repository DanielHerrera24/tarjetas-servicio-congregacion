import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser"; // Importa EmailJS
import { useDarkMode } from "../context/DarkModeContext";

function Register() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    name: "",
    congregacion: "",
    otraCongregacion: "",
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false); // Estado del checkbox
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // Estado del modal
  const { darkMode } = useDarkMode();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };

  const sendEmail = (uid) => {
    const templateParams = {
      nombre: user.name,
      email: user.email,
      congregacion:
        user.congregacion === "otra"
          ? user.otraCongregacion
          : user.congregacion,
      uid: uid,
    };

    emailjs
      .send(
        "service_gzsf4vl", // Reemplaza con tu Service ID de EmailJS
        "template_y8tj3os", // Reemplaza con tu Template ID
        templateParams,
        "LzEFFyFQExH4PM7z8" // Reemplaza con tu Public Key de EmailJS
      )
      .then(
        (response) => {
          console.log(
            "Correo enviado exitosamente:",
            response.status,
            response.text
          );
        },
        (err) => {
          console.error("Error al enviar el correo:", err);
        }
      );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Crear el usuario
      const userCredential = await signup(user.email, user.password);
      const uid = userCredential.user.uid;

      // Guardar información en Firestore
      const congregacionFinal =
        user.congregacion === "otra"
          ? user.otraCongregacion
          : user.congregacion;

      await setDoc(doc(db, "usuarios", uid), {
        uid: uid, // Asegúrate de usar el uid obtenido de userCredential
        nombre: user.name,
        email: user.email,
        congregacion: congregacionFinal,
        role: "Espectador",
      });

      // Enviar el correo de bienvenida
      sendEmail(uid);

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
              <option value="del valle">Congregación Del Valle</option>
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

          {/* Aviso de privacidad */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="privacy"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="form-checkbox"
              required
            />
            <label htmlFor="" className="text-sm">
              Acepto y he leído el{" "}
              <span
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                aviso de privacidad
              </span>
              .
            </label>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={!acceptedPrivacy}
            className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
              acceptedPrivacy
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
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
      {/* Modal del aviso de privacidad */}
      {showPrivacyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg max-w-md w-full border ${
              darkMode
                ? "bg-[#303030] text-white border-white"
                : "bg-white text-black border-black"
            } overflow-y-auto max-h-[70vh]`}
          >
            <h3 className="text-lg font-bold mb-4">Aviso de Privacidad</h3>
            <p className="text-sm mb-4">
              Este Aviso de Privacidad describe cómo recopilamos, utilizamos y
              protegemos tus datos personales. Al registrarte en nuestra
              aplicación, aceptas los términos descritos a continuación:
            </p>
            <ul className="text-sm text-left mb-4 list-disc pl-6 flex flex-col gap-3">
              <li>
                <strong>Datos que recopilamos:</strong> nombre, correo
                electrónico, contraseña y nombre de la congregación.
              </li>
              <li>
                <strong>Propósito de la recopilación:</strong> proporcionar
                acceso a la aplicación y permitirte acceder a la información de
                tu congregación correspondiente.
              </li>
              <li>
                <strong>Compartimos datos con:</strong> Firebase (para
                almacenamiento y autenticación) y EmailJs (para notificaciones y
                correos electrónicos).
              </li>
              <li>
                <strong>Almacenamiento:</strong> Los datos se guardan en
                servidores seguros de Firebase con acceso restringido y
                protegidos mediante reglas avanzadas de seguridad.
              </li>
              <li>
                <strong>Derechos del usuario:</strong> Puedes solicitar acceso a
                tus datos en cualquier momento.
              </li>
              <li>
                <strong>Consentimiento obligatorio:</strong> Proporcionar los
                datos mencionados es necesario para acceder a la aplicación. Sin
                esta información, no se podrá otorgar acceso.
              </li>
              <li>
                <strong>Retención de datos:</strong> Los datos se almacenan
                hasta que decidas eliminar tu cuenta.
              </li>
              <li>
                <strong>Alcance geográfico:</strong> Este Aviso de Privacidad se
                aplica exclusivamente a usuarios en México.
              </li>
            </ul>
            <p className="text-sm mb-4">
              Si tienes preguntas o deseas más información, contacta a tu supervisor.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
