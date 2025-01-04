import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

const AssignCustomClaim = () => {
  const [uid, setUid] = useState("");
  const [congregacionId, setCongregacionId] = useState("");
  const [message, setMessage] = useState("");

  const handleAssignClaim = async (e) => {
    e.preventDefault();
    if (!uid || !congregacionId) {
      setMessage("Por favor, llena todos los campos.");
      return;
    }

    try {
      // Inicializar funciones de Firebase
      const functions = getFunctions();
      const setCustomClaims = httpsCallable(functions, "setCustomClaims");

      // Llamar a la función en el backend
      const result = await setCustomClaims({ uid, congregacionId });

      setMessage(`CustomClaim asignado exitosamente: ${result.data.message}`);
    } catch (error) {
      console.error("Error al asignar CustomClaim:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Acceso Nuevo Usuario</h2>
      <form onSubmit={handleAssignClaim} className="space-y-4">
        <div>
          <label htmlFor="uid" className="block font-medium">
            UID del Usuario
          </label>
          <input
            id="uid"
            type="text"
            className="w-full border p-2 rounded text-black"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="congregacionId" className="block font-medium">
            Congregación ID
          </label>
          <input
            id="congregacionId"
            type="text"
            className="w-full border p-2 rounded text-black"
            value={congregacionId}
            onChange={(e) => setCongregacionId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Dar Acceso
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AssignCustomClaim;
