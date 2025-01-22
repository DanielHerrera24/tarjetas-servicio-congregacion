import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";
import { toast } from "react-toastify";

const AssignCustomClaim = () => {
  const { darkMode } = useDarkMode();
  const [users, setUsers] = useState([]); // Lista de usuarios de Firebase
  const [selectedUser, setSelectedUser] = useState(""); // Usuario seleccionado
  const [congregacionId, setCongregacionId] = useState(""); // Congregación seleccionada automáticamente
  const location = useLocation();
  const { congregacion } = location.state || {};
  const { user, role } = useAuth(); // Obtener el usuario y el rol del contexto

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let usersQuery;

        // Si el usuario es el administrador o tiene el rol adecuado, consulta todas las congregaciones
        if (user.uid === "pbmZW6cLgARZw8Ogv6jWXV2Zcdx1" || role === "admin") {
          // Administrador puede ver todas las congregaciones
          usersQuery = collection(db, "usuarios");
        } else {
          // Consultar solo los usuarios de la congregación correspondiente
          usersQuery = query(
            collection(db, "usuarios"),
            where("congregacion", "==", congregacion)
          );
        }

        const querySnapshot = await getDocs(usersQuery);
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, [congregacion, role, user.uid]);

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);

    const selectedUserData = users.find((user) => user.id === userId);
    if (selectedUserData) {
      setCongregacionId(selectedUserData.congregacion || "");
    } else {
      setCongregacionId("");
    }
  };

  const assignClaim = async () => {
    if (!selectedUser || !congregacionId) {
      toast.error(
        "Por favor, selecciona un usuario que tenga su id de congregación.",
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
      return;
    }

    try {
      const token = await getAuth().currentUser.getIdToken(true);
      const response = await fetch(
        "https://us-central1-tarjetas-congregacion-sur.cloudfunctions.net/assignCustomClaim",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Usar el token de autorización
          },
          body: JSON.stringify({
            uid: selectedUser,
            congregacionId: congregacionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al asignar claim: ${response.statusText}`);
      }

      // Obtener el nombre del usuario seleccionado para mostrarlo en el mensaje de éxito
      const selectedUserData = users.find((user) => user.id === selectedUser);
      toast.success(`Acceso al usuario: "${selectedUserData.nombre}" correctamente".`, {
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
      setSelectedUser("")
      setCongregacionId("")
    } catch (error) {
      console.error("Error: ", error);
      toast.error(
        "Error al dar acceso al usuario.",
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
      className={`p-4 max-w-lg mx-auto shadow-md border rounded-lg ${
        darkMode ? "text-white" : "text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Dar acceso a la App</h1>

      <div className="mb-4">
        <label htmlFor="user" className="block font-medium">
          Seleccionar Usuario:
        </label>
        <select
          id="user"
          value={selectedUser}
          onChange={handleUserSelect}
          className="w-full mt-2 p-2 border rounded-md text-black"
        >
          <option value="">Seleccione un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nombre || "Sin nombre"}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="congregacion" className="block font-medium">
          Congregación ID:
        </label>
        <input
          type="text"
          id="congregacion"
          value={congregacionId}
          disabled
          className="w-full mt-2 p-2 border rounded-md text-black bg-gray-300 cursor-not-allowed"
        />
      </div>

      <button
        onClick={assignClaim}
        className="w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Dar Acceso
      </button>
    </div>
  );
};

export default AssignCustomClaim;
