import { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useDarkMode } from "../context/DarkModeContext";
import AssignCustomClaim from "./AssignCustomClaim";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Accesos() {
  const { darkMode } = useDarkMode();
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("admin");

  const handleAssignRole = async (e) => {
    e.preventDefault();

    if (!uid || !role) {
      toast.error("Por favor, llena todos los campos.", {
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
      return;
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, "usuarios", uid); // Referencia al documento del usuario
      await setDoc(
        userRef,
        { role }, // Asignar el rol
        { merge: true } // Evitar sobrescribir otros campos
      );

      toast.success(
        `Rol '${role}' asignado exitosamente al usuario con UID '${uid}'.`,
        {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        }
      );

      setUid(""); // Limpiar el campo UID
      setRole("admin"); // Restablecer el valor del rol
    } catch (error) {
      console.error("Error al asignar rol:", error);
      toast.error(
        "Error al asignar rol. Verifica la consola para más detalles.",
        {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        }
      );
    }
  };

  return (
    <div
      className={`sm:flex gap-3 mt-4 ${darkMode ? "text-white" : "text-black"}`}
    >
      <ToastContainer />
      <form
        onSubmit={handleAssignRole}
        className="p-4 border rounded flex flex-col justify-center items-center gap-4"
      >
        <h2 className="text-xl font-bold">Acceso a Admin</h2>
        <div className="flex flex-col">
          <label htmlFor="uidUser" className="font-semibold">
            UID Usuario
          </label>
          <input
            type="text"
            name="uidUser"
            id="uidUser"
            className="text-black p-2 rounded border"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="role" className="font-semibold">
            Rol
          </label>
          <select
            name="role"
            id="role"
            className="text-black p-2 rounded border"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
            {/* Puedes agregar más roles si los necesitas */}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Asignar Rol
        </button>
      </form>
      <AssignCustomClaim />
    </div>
  );
}

export default Accesos;
