import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const AssignCustomClaim = () => {
  const [users, setUsers] = useState([]); // Lista de usuarios de Firebase
  const [selectedUser, setSelectedUser] = useState(""); // Usuario seleccionado
  const [congregacionId, setCongregacionId] = useState(""); // Congregación seleccionada automáticamente
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
    if (!selectedUser ) {
      setErrorMessage("Por favor, selecciona un usuario y define un claim.");
      return;
    }

    try {
      const tokenUrl = `https://us-central1-your-project.cloudfunctions.net/assignCustomClaim`;

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuth().currentUser.getIdToken(
            true
          )}`,
        },
        body: JSON.stringify({
          uid: selectedUser,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al asignar claim: ${response.statusText}`);
      }

      setSuccessMessage("Claim asignado correctamente.");
      setErrorMessage("");
    } catch (error) {
      console.error("Error: ", error);
      setErrorMessage("Hubo un error al asignar el claim.");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Asignar Custom Claim</h1>

      <div className="mb-4">
        <label htmlFor="user" className="block text-gray-700 font-medium">
          Seleccionar Usuario:
        </label>
        <select
          id="user"
          value={selectedUser}
          onChange={handleUserSelect}
          className="w-full mt-2 p-2 border rounded-md"
        >
          <option value="">Seleccione un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email} ({user.nombre || "Sin nombre"})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="congregacion"
          className="block text-gray-700 font-medium"
        >
          Congregación ID:
        </label>
        <input
          type="text"
          id="congregacion"
          value={congregacionId}
          disabled
          className="w-full mt-2 p-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
      </div>

      {successMessage && (
        <p className="text-green-600 mb-4">{successMessage}</p>
      )}
      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <button
        onClick={assignClaim}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Asignar Claim
      </button>
    </div>
  );
};

export default AssignCustomClaim;
