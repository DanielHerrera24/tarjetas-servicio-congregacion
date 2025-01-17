import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SyncLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Cuenta() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      if (user) {
        try {
          const usuarioRef = doc(db, "usuarios", user.uid);
          const usuarioSnapshot = await getDoc(usuarioRef);
          if (usuarioSnapshot.exists()) {
            const datos = usuarioSnapshot.data();
            setNombre(datos.nombre || "");
            setEmail(datos.email || user.email);
            setRole(datos.role || "Sin rol asignado");
          }
        } catch (e) {
          console.error("Error al obtener datos del usuario:", e);
        } finally {
          setLoading(false);
        }
      }
    };

    obtenerDatosUsuario();
  }, [user]);

  const manejarGuardarCambios = async () => {
    if (user) {
      try {
        const usuarioRef = doc(db, "usuarios", user.uid);
        await updateDoc(usuarioRef, { nombre, email });
        toast.success(`Cambios guardados correctamente.`, {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        });
      } catch (e) {
        console.error("Error al guardar cambios:", e);
        toast.error("Error al guardar los cambios.", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <SyncLoader color="#3B82F6" />
      </div>
    );
  }

  return (
    <div
      className={`max-w-md mx-auto p-6 rounded-lg shadow-lg relative ${
        darkMode
          ? "bg-[#303030] text-white shadow-gray-600"
          : "bg-[#f3f3f3] text-black"
      }`}
    >
      <div>
        <button
          onClick={() => navigate(-1)}
          className={`hidden sm:block sm:absolute -left-20 top-0 shadow-lg border rounded-full p-3 mt-0 text-red-500 ${
            darkMode
              ? "bg-gray-800 border-white hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          } hover:scale-110`}
        >
          <FaArrowLeft size={24} />
        </button>
      </div>
      <ToastContainer />
      <h1 className="text-2xl font-bold text-blue-500 mb-4">Mi Cuenta</h1>
      <div className="mb-4">
        <label className="block font-bold mb-2">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Correo</label>
        <p className="w-full px-4 py-2 border rounded-lg bg-gray-300 text-black">
          {email}
        </p>
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Rol</label>
        <p className="w-full px-4 py-2 border rounded-lg bg-gray-300 text-black">
          {role}
        </p>
      </div>
      <button
        onClick={manejarGuardarCambios}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg w-full transition-colors duration-300"
      >
        Guardar Cambios
      </button>
    </div>
  );
}

export default Cuenta;
