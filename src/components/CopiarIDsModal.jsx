/* eslint-disable react/prop-types */
import { useState } from "react";
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";
import { IoCopy } from "react-icons/io5";
import { collection, getDocs } from "firebase/firestore";
import { SyncLoader } from "react-spinners";

const CopiarIDsModal = ({ db, congregacionId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupos, setGrupos] = useState({});
  const [grupoActual, setGrupoActual] = useState(null);
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);

  // Función para abrir el modal
  const openModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    await fetchGrupos();
    setLoading(false);
  };

  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  // Función para obtener los grupos y sus IDs desde Firestore
  const fetchGrupos = async () => {
    try {
      const gruposSnapshot = await getDocs(
        collection(db, "congregaciones", congregacionId, "grupos")
      );
      const gruposData = {};

      for (const grupoDoc of gruposSnapshot.docs) {
        const grupoId = grupoDoc.id;
        const grupoNombre = grupoDoc.data().nombre || "Sin Nombre";

        const hermanosSnapshot = await getDocs(
          collection(
            db,
            "congregaciones",
            congregacionId,
            "grupos",
            grupoId,
            "hermanos"
          )
        );
        gruposData[grupoId] = {
          nombre: grupoNombre,
          hermanos: hermanosSnapshot.docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre || "Sin Nombre",
          })),
        };
      }

      setGrupos(gruposData);
      setGrupoActual(Object.keys(gruposData)[0]); // Seleccionar el primer grupo por defecto
    } catch (error) {
      toast.error(`Error al obtener los grupos: ${error.message}`, {
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
  };

  // Función para copiar los IDs del grupo actual al portapapeles
  const copiarAlPortapapeles = (tipo) => {
    const datos =
      tipo === "nombre"
        ? grupos[grupoActual]?.hermanos.map(({ nombre }) => nombre).join("\n")
        : grupos[grupoActual]?.hermanos.map(({ id }) => id).join("\n");

    if (datos) {
      navigator.clipboard.writeText(datos).then(() => {
        toast.success(
          tipo === "nombre"
            ? "Nombres copiados al portapapeles."
            : "IDs copiados al portapapeles.",
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
      });
    } else {
      toast.error(
        tipo === "nombre"
          ? "No hay nombres para copiar."
          : "No hay IDs para copiar.",
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
            className={`p-6 rounded-2xl shadow-lg max-w-lg ${
              loading ? "w-52" : "w-full"
            } ${
              darkMode
                ? "bg-[#1f1f1f] border-white text-white shadow-slate-600"
                : "bg-white border-black text-black"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <SyncLoader color="#3B82F6" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">IDs por Grupo</h2>
                <div className="flex mb-4 overflow-x-auto space-x-2">
                  {Object.keys(grupos).map((grupoId) => (
                    <button
                      key={grupoId}
                      onClick={() => setGrupoActual(grupoId)}
                      className={`px-4 py-2 rounded min-w-28 ${
                        grupoActual === grupoId
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-black hover:bg-gray-400"
                      }`}
                    >
                      {grupos[grupoId].nombre}
                    </button>
                  ))}
                </div>
                <ul className="mb-4 grid grid-cols-2 gap-4 max-h-[338px] sm:max-h-[512px] overflow-y-scroll">
                  <div>
                    <h3 className="font-semibold mb-2">Nombres</h3>
                    {grupos[grupoActual]?.hermanos.map(({ id, nombre }) => (
                      <li key={id} className="border-b text-left">
                        {nombre}
                      </li>
                    )) || <p>No hay hermanos en este grupo.</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">IDs</h3>
                    {grupos[grupoActual]?.hermanos.map(({ id }) => (
                      <li key={id} className="border-b text-left">
                        {id}
                      </li>
                    )) || <p>No hay IDs en este grupo.</p>}
                  </div>
                </ul>

                <div className="flex justify-between space-x-2">
                  <button
                    onClick={() => copiarAlPortapapeles("nombre")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Copiar Nombres
                  </button>
                  <button
                    onClick={() => copiarAlPortapapeles("id")}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Copiar IDs
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CopiarIDsModal;
