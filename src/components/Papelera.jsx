import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Papelera = () => {
  const { grupoId, congregacionId } = useParams();
  const [personasEliminadas, setPersonasEliminadas] = useState([]);
  const [loadingPapelera, setLoadingPapelera] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal

  useEffect(() => {
    const fetchPersonasEliminadas = async () => {
      try {
        const papeleraCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoId,
          "hermanos"
        );

        const q = query(papeleraCollection, where("isDeleted", "==", true));
        const snapshot = await getDocs(q);

        const eliminadas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPersonasEliminadas(eliminadas);
      } catch (error) {
        console.log("Error al obtener las personas eliminadas: ", error);
      } finally {
        setLoadingPapelera(false);
      }
    };

    fetchPersonasEliminadas();
  }, [congregacionId, grupoId, personasEliminadas]);

  const handleRestore = async (id, nombre) => {
    try {
      const result = await Swal.fire({
        title: `¿Quieres restaurar a ${nombre}?`,
        text: "La persona será movida de la papelera de nuevo al grupo.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Sí, restaurar",
      });

      if (result.isConfirmed) {
        const personaRef = doc(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoId,
          "hermanos",
          id
        );

        await updateDoc(personaRef, { isDeleted: false });

        toast.success(`Tarjeta de ${nombre} restaurada exitosamente.`, {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setIsModalOpen(false)
        setPersonasEliminadas(personasEliminadas.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.log("Error al restaurar la persona: ", error);
      toast.error("Error al restaurar la persona.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handlePermanentDelete = async (id, nombre) => {
    try {
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar permanentemente a ${nombre}?`,
        text: "Esta acción no se puede revertir.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Sí, eliminar permanentemente",
      });

      if (result.isConfirmed) {
        const personaRef = doc(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoId,
          "hermanos",
          id
        );

        await deleteDoc(personaRef);

        toast.success(`Tarjeta de ${nombre} eliminada permanentemente.`, {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setIsModalOpen(false)
        setPersonasEliminadas(personasEliminadas.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.log("Error al eliminar permanentemente la persona: ", error);
      toast.error("Error al eliminar la persona.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <div className="sm:pt-8">
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex gap-3 items-center bg-white text-red-500 px-4 py-2 rounded border border-black hover:bg-red-500 hover:text-white hover:border-none transition duration-200"
      >
        Ver Papelera
        <FaTrash />
      </button>

      {/* Modal para mostrar la papelera */}
      {isModalOpen && (
        <div className="fixed z-20 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">Tarjetas Eliminadas</h2>

              {loadingPapelera ? (
                <div className="flex justify-center items-center">
                  <SyncLoader color="#3B82F6" />
                </div>
              ) : personasEliminadas.length > 0 ? (
                personasEliminadas.map((persona) => (
                  <div
                    key={persona.id}
                    className="tarjeta-eliminada flex justify-between items-center p-4 border border-black shadow-md rounded mb-2"
                  >
                    <span>{persona.nombre}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleRestore(persona.id, persona.nombre)
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() =>
                          handlePermanentDelete(persona.id, persona.nombre)
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay tarjetas en la papelera.</p>
              )}

              {/* Botón para cerrar el modal */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-400 hover:bg-gray-600 text-white px-4 py-2 rounded mt-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Papelera;
