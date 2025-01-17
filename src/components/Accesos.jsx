import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { useDarkMode } from "../context/DarkModeContext";
import AssignCustomClaim from "./AssignCustomClaim";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function Accesos() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [users, setUsers] = useState([]); // Lista de usuarios
  const [selectedUid, setSelectedUid] = useState(""); // UID seleccionado
  const [selectedRole, setSelectedRole] = useState(""); // Rol actual del usuario seleccionado
  const [newRole, setNewRole] = useState("selecciona"); // Nuevo rol a asignar
  const location = useLocation();
    const { congregacion } = location.state || {};

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const db = getFirestore();
        const userCongregationId = congregacion; // Reemplaza con el ID de la congregación actual
        const usersQuery = query(
          collection(db, "usuarios"),
          where("congregacion", "==", userCongregationId)
        );

        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsers = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = (uid) => {
    setSelectedUid(uid);
    const user = users.find((user) => user.uid === uid);
    setSelectedRole(user?.role || "");
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();

    if (!selectedUid || !newRole || newRole === "selecciona") {
      toast.error("Por favor, selecciona un usuario y un rol válido.", {
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
      const userRef = doc(db, "usuarios", selectedUid);
      await setDoc(userRef, { role: newRole }, { merge: true });

      toast.success(
        `Rol '${newRole}' asignado exitosamente al usuario '${selectedUid}'.`,
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

      // Actualizar el rol del usuario en la lista local
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === selectedUid ? { ...user, role: newRole } : user
        )
      );

      setSelectedUid("");
      setSelectedRole("");
      setNewRole("selecciona");
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
      <div>
        <button
          onClick={() => navigate(-1)}
          className={`hidden sm:block shadow-lg border rounded-full p-3 mt-0 text-red-500 ${
            darkMode
              ? "bg-gray-800 border-white hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          } hover:scale-110`}
        >
          <FaArrowLeft size={24} />
        </button>
      </div>
      <ToastContainer />
      <AssignCustomClaim />
      <form
        onSubmit={handleAssignRole}
        className="p-4 border rounded flex flex-col justify-center items-center gap-4"
      >
        <h2 className="text-xl font-bold">Asignar Roles</h2>
        <div className="flex flex-col">
          <label htmlFor="userSelect" className="font-semibold">
            Seleccionar Usuario
          </label>
          <select
            name="userSelect"
            id="userSelect"
            className="text-black p-2 rounded border"
            value={selectedUid}
            onChange={(e) => handleUserSelect(e.target.value)}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.nombre}
              </option>
            ))}
          </select>
        </div>

        {selectedRole && (
          <div className="flex flex-col">
            <p className="font-semibold">Rol Actual: {selectedRole}</p>
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="role" className="font-semibold">
            Nuevo Rol
          </label>
          <select
            name="role"
            id="role"
            className="text-black p-2 rounded border"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="selecciona">Selecciona el rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Gestor">Gestor</option>
            <option value="Editor">Editor</option>
            <option value="Espectador">Espectador</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Asignar Rol
        </button>
      </form>
    </div>
  );
}

export default Accesos;
