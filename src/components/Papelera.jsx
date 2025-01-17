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
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";

const Papelera = () => {
  const { grupoId, congregacionId } = useParams();
  const [personasEliminadas, setPersonasEliminadas] = useState([]);
  const [loadingPapelera, setLoadingPapelera] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  const { darkMode } = useDarkMode();
  const { role } = useAuth();

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
        customClass: {
          popup: "swal-custom-popup",
        },
        didOpen: () => {
          const swalPopup = document.querySelector(".swal-custom-popup");
          if (swalPopup) {
            swalPopup.style.backgroundColor = darkMode ? "#1f1f1f" : "#ffffff";
            swalPopup.style.color = darkMode ? "#ffffff" : "#000000";
            swalPopup.style.border = darkMode ? "1px solid #ffffff" : "none";
          }
        },
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
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000", // Borde blanco en modo oscuro
          },
        });
        setIsModalOpen(false);
        setPersonasEliminadas(personasEliminadas.filter((p) => p.id !== id));
      }
    } catch (error) {
      // Verifica si el error es el relacionado con permisos insuficientes
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para restaurar tarjetas. Por favor, contacta al supervisor.",
          {
            position: "bottom-center",
            autoClose: 5000, // El mensaje permanecerá 5 segundos
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000", // Borde blanco en modo oscuro
            },
          }
        );
      } else {
        // Aquí puedes manejar otros tipos de errores si lo deseas
        toast.error(
          "Error al restaurar tarjeta. Por favor, intenta nuevamente.",
          {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          }
        );
      }
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
        customClass: {
          popup: "swal-custom-popup",
        },
        didOpen: () => {
          const swalPopup = document.querySelector(".swal-custom-popup");
          if (swalPopup) {
            swalPopup.style.backgroundColor = darkMode ? "#1f1f1f" : "#ffffff";
            swalPopup.style.color = darkMode ? "#ffffff" : "#000000";
            swalPopup.style.border = darkMode
              ? "1px solid #ffffff"
              : "1px solid #000000";
          }
        },
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
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000", // Borde blanco en modo oscuro
          },
        });
        setIsModalOpen(false);
        setPersonasEliminadas(personasEliminadas.filter((p) => p.id !== id));
      }
    } catch (error) {
      // Verifica si el error es el relacionado con permisos insuficientes
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para eliminar tarjetas permanentemente. Por favor, contacta al supervisor.",
          {
            position: "bottom-center",
            autoClose: 5000, // El mensaje permanecerá 5 segundos
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000", // Borde blanco en modo oscuro
            },
          }
        );
      } else {
        // Aquí puedes manejar otros tipos de errores si lo deseas
        toast.error(
          "Error al eliminar la tarjeta permanentemente. Por favor, intenta nuevamente.",
          {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          }
        );
      }
    }
  };

  return (
    <div className="">
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex gap-3 items-center text-red-500 px-4 py-2 rounded border border-black hover:bg-red-500 hover:text-white hover:border-none transition duration-200 ${
          darkMode ? "bg-gray-800 border border-white" : "bg-[#ffffff]"
        }`}
      >
        Ver Papelera
        <FaTrash />
      </button>

      {/* Modal para mostrar la papelera */}
      {isModalOpen && (
        <div className="fixed z-20 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`rounded-lg border shadow-lg max-w-lg w-full ${
              darkMode
                ? "bg-[#303030] text-white border-white shadow-gray-600"
                : "bg-[#ffffff] text-black border-black"
            }`}
          >
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
                    className={`tarjeta-eliminada flex justify-between items-center p-4 border border-black shadow-md rounded mb-2 ${
                      darkMode
                        ? "bg-[#1e1e1e] border border-white shadow-gray-600"
                        : "bg-[#f9f9f9]"
                    }`}
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
                      {(role === "Administrador" ||
                        role === "Gestor" ||
                        role === "Espectador") && (
                        <button
                          onClick={() =>
                            handlePermanentDelete(persona.id, persona.nombre)
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-900"
                        >
                          Eliminar
                        </button>
                      )}
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
