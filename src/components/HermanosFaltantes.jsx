/* eslint-disable react/prop-types */
import { useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import Modal from "./Modal"; // Importa un componente Modal si ya tienes uno, o crea uno nuevo.
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { useDarkMode } from "../context/DarkModeContext";

const HermanosFaltantes = ({ congregacionId }) => {
  const [hermanosFaltantes, setHermanosFaltantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { role } = useAuth();
  const { darkMode } = useDarkMode();

  const fetchHermanosFaltantes = async () => {
    setLoading(true);
    try {
      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );
      const gruposSnapshot = await getDocs(gruposCollection);

      const faltantes = [];

      for (const grupoDoc of gruposSnapshot.docs) {
        const hermanosCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoDoc.id,
          "hermanos"
        );
        const hermanosSnapshot = await getDocs(hermanosCollection);

        hermanosSnapshot.docs.forEach((hermanoDoc) => {
          const hermanoData = hermanoDoc.data();
          const { genero, fechaBautismo, fechaNacimiento } = hermanoData;

          // Verificar si no debe mostrarse basado en las condiciones de género
          const noMostrar =
            genero?.otrasOvejas === false || // "otrasOvejas" es false
            genero?.otrasOvejas === undefined || // "otrasOvejas" es undefined
            (genero && Object.keys(genero).length <= 1) || // "genero" tiene solo un campo
            !genero || // "genero" no tiene nada (null, undefined, objeto vacío)
            (genero && Object.keys(genero).length === 0); // "genero" es un objeto vacío

          // Filtrar hermanos que cumplen las condiciones de datos faltantes y género
          if (!noMostrar && (!fechaBautismo || !fechaNacimiento)) {
            faltantes.push({
              id: hermanoDoc.id,
              ...hermanoData,
              grupo: grupoDoc.id, // Añade el grupo para más contexto.
            });
          }
        });
      }

      setHermanosFaltantes(faltantes);
      setIsModalOpen(true); // Abre el modal al terminar.
    } catch (error) {
      console.error("Error al buscar hermanos faltantes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (hermanoId, grupoId, updatedData) => {
    try {
      const hermanoRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoId,
        "hermanos",
        hermanoId
      );
      await updateDoc(hermanoRef, updatedData);
      setHermanosFaltantes((prev) =>
        prev.map((hermano) =>
          hermano.id === hermanoId ? { ...hermano, ...updatedData } : hermano
        )
      );
    } catch (error) {
      console.error("Error al actualizar la información:", error.message);
    }
  };

  return (
    <div>
      {role === "Gestor" && (
        <button
          onClick={fetchHermanosFaltantes}
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {loading ? "Buscando..." : "Mostrar Hermanos Faltantes"}
        </button>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Hermanos Faltantes</h2>
          {hermanosFaltantes.length > 0 ? (
            <ul
              className={`space-y-2 ${
                darkMode
                  ? "bg-[#1f1f1f] border-white shadow-slate-600"
                  : "bg-white border-black"
              }`}
            >
              {hermanosFaltantes.map((hermano) => (
                <li key={hermano.id} className="p-2 border rounded shadow">
                  <p>
                    <strong>Nombre:</strong> {hermano.nombre || "Sin nombre"}
                  </p>
                  <p>
                    <strong>Grupo:</strong> {hermano.grupo || "Sin grupo"}
                  </p>
                  <div>
                    <label>
                      <strong>Fecha Nacimiento:</strong>
                      <input
                        type="text"
                        placeholder="01/Enero/2025"
                        value={hermano.fechaNacimiento || ""}
                        onChange={(e) =>
                          setHermanosFaltantes((prev) =>
                            prev.map((h) =>
                              h.id === hermano.id
                                ? { ...h, fechaNacimiento: e.target.value }
                                : h
                            )
                          )
                        }
                        className="ml-2 border p-1 rounded text-black"
                      />
                    </label>
                  </div>
                  <div>
                    <label>
                      <strong>Fecha Bautismo:</strong>
                      <input
                        type="text"
                        placeholder="01/Enero/2025"
                        value={hermano.fechaBautismo || ""}
                        onChange={(e) =>
                          setHermanosFaltantes((prev) =>
                            prev.map((h) =>
                              h.id === hermano.id
                                ? { ...h, fechaBautismo: e.target.value }
                                : h
                            )
                          )
                        }
                        className="ml-2 border p-1 rounded text-black"
                      />
                    </label>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdate(hermano.id, hermano.grupo, {
                        fechaBautismo: hermano.fechaBautismo,
                        fechaNacimiento: hermano.fechaNacimiento,
                      })
                    }
                    className="mt-2 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                  >
                    Guardar cambios
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron hermanos con datos faltantes.</p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default HermanosFaltantes;
