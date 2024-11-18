/* eslint-disable react/prop-types */
import { useState } from "react";
import { toast } from "react-toastify";


const CopiarIDsModal = ({ filteredPersonas }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        theme: "light",
      });
    });
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Ver y copiar IDs
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">IDs de Personas</h2>
            <ul className="mb-4">
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
