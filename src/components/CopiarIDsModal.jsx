/* eslint-disable react/prop-types */
import { useState } from "react";
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";
import { IoCopy } from "react-icons/io5";

const CopiarIDsModal = ({ filteredPersonas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { darkMode } = useDarkMode();

  // Función para abrir el modal
  const openModal = () => setIsModalOpen(true);

  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  // Función para copiar los IDs al portapapeles
  const copiarAlPortapapeles = () => {
    const ids = filteredPersonas.map((persona) => persona.id).join("\n");
    navigator.clipboard.writeText(ids).then(() => {
      toast.success(`IDs copiados al portapapeles.`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: darkMode ? "dark" : "light",
        style: {
          border: darkMode ? "1px solid #ffffff" : "1px solid #000000", // Borde blanco en modo oscuro
        },
      });
    });
  };

  return (
    <div className="flex justify-center">
      {/* Botón para abrir el modal */}
      <button
        onClick={openModal}
        className="bg-blue-500 text-white flex items-center gap-2 justify-center px-4 py-2 rounded hover:bg-blue-600"
      >
        Ver y copiar IDs
        <IoCopy />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div
            className={`p-6 rounded shadow-lg max-w-lg w-full ${
              darkMode
                ? "bg-[#1f1f1f] border-white text-white shadow-slate-600"
                : "bg-white border-black text-black"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">IDs de Personas</h2>
            <ul className="mb-4 max-h-96 sm:max-h-[512px] overflow-y-scroll">
              {filteredPersonas.map((persona) => (
                <li key={persona.id} className="border-b text-left">
                  {persona.id}
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-2">
              <button
                onClick={copiarAlPortapapeles}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Copiar al portapapeles
              </button>
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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

export default CopiarIDsModal;
