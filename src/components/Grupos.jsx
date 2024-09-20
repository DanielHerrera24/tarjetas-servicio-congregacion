import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { SyncLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

function Grupos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal
  const [newGrupo, setNewGrupo] = useState(""); // Estado para manejar el nombre del nuevo grupo
  const [grupoToDelete, setGrupoToDelete] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año seleccionado
  const [years, setYears] = useState([]); // Lista de años
  const [yearToAdd, setYearToAdd] = useState(""); // Año a agregar
  const [showYearModal, setShowYearModal] = useState(false);
  const location = useLocation(); // Obtener el año desde la ubicación
  const { congregacionId } = useParams();

  const fetchGrupos = async () => {
    try {
      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );
      const q = query(gruposCollection, orderBy("nombre", "asc")); // Ordenar por el campo 'nombre'
      const grupoSnapshot = await getDocs(q);
      const grupoList = grupoSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGrupos(grupoList);
    } catch (error) {
      console.error("Error al obtener los grupos:", error.message, error.code);
    } finally {
      setLoading(false); // Termina el loading cuando los datos se han cargado
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, [congregacionId]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const yearFromParams = queryParams.get("year");
    if (yearFromParams) {
      setSelectedYear(yearFromParams);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const gruposCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos"
        );
        const q = query(gruposCollection, orderBy("nombre", "asc"));
        const grupoSnapshot = await getDocs(q);
        const grupoList = grupoSnapshot.docs.map((doc) => doc.id);

        const yearsSet = new Set();

        for (const grupoId of grupoList) {
          const personasCollection = collection(
            db,
            "congregaciones",
            congregacionId,
            "grupos",
            grupoId,
            "hermanos"
          );
          const personasSnapshot = await getDocs(personasCollection);

          personasSnapshot.docs.forEach((doc) => {
            const registros = doc.data().registros || {};
            Object.keys(registros).forEach((year) => yearsSet.add(year));
          });
        }

        setYears(Array.from(yearsSet).sort());
      } catch (error) {
        toast.error("Error al obtener los años disponibles.");
        console.error("Error al obtener los años disponibles:", error);
      }
    };

    fetchYears();
  }, [congregacionId]);

  const handleAddYear = async () => {
    try {
      const year = parseInt(yearToAdd, 10);

      if (isNaN(year) || year <= 0) {
        toast.error("Por favor, ingresa un año válido.", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      for (const grupo of grupos) {
        const grupoDocRef = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupo.id,
          "hermanos"
        );

        const personasSnapshot = await getDocs(grupoDocRef);
        const updatePromises = personasSnapshot.docs.map((doc) => {
          const personaRef = doc.ref;
          return updateDoc(personaRef, {
            [`registros.${year}`]: {}, // Agrega el nuevo año de registros vacío
          });
        });

        await Promise.all(updatePromises);
      }

      toast.success("Año agregado a todas las personas correctamente.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setYearToAdd(""); // Resetea el año a agregar
    } catch (error) {
      toast.error("Error al añadir el año a todas las personas.");
      console.error("Error al añadir el año a todas las personas:", error);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    // Aquí puedes cargar los años disponibles si se almacenan en alguna parte
    // o calcular dinámicamente basándote en los datos
    setYears([]); // Ejemplo de años
  }, []);

  const handleAddGrupo = async () => {
    const trimmedGrupo = newGrupo.trim();
    if (!trimmedGrupo) return;

    try {
      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );

      // Crea un ID personalizado basado en el nombre del grupo
      const grupoId = trimmedGrupo.toLowerCase().replace(/\s+/g, "-"); // Convierte a minúsculas y reemplaza espacios por guiones

      const grupoDocRef = doc(gruposCollection, grupoId);
      await setDoc(grupoDocRef, { nombre: newGrupo });

      toast.success("Grupo agregado correctamente.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setShowModal(false); // Cierra el modal
      setNewGrupo(""); // Resetea el estado del nuevo grupo
      fetchGrupos(); // Vuelve a cargar los grupos
    } catch (error) {
      console.error("Error al añadir el grupo:", error);
    }
  };

  const handleDeleteGrupo = async () => {
    if (!grupoToDelete) return;

    try {
      const grupoDoc = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoToDelete
      );
      await deleteDoc(grupoDoc);
      toast.success("Grupo eliminado correctamente.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setShowDeleteModal(false); // Cierra el modal de eliminar
      setGrupoToDelete(""); // Resetea el estado del grupo a eliminar
      fetchGrupos(); // Vuelve a cargar los grupos
    } catch (error) {
      console.error("Error al eliminar el grupo:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <ToastContainer />
      <button
        onClick={() => navigate(-1)}
        className="hidden sm:block absolute top-0 left-0 bg-white shadow-lg border border-black rounded-full p-3 text-red-500"
      >
        <FaArrowLeft size={24} />
      </button>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <SyncLoader color="#3B82F6" />
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-semibold mb-6 text-black">
            Grupos congregación {congregacionId}
          </h2>
          {user?.uid === "5wyoaagTbJOyE6ybQlxjH5Ue8tX2" && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowYearModal(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Añadir Año
              </button>
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center justify-center">
            <label
              htmlFor="year-select"
              className="mr-4 text-lg font-medium text-gray-700 mb-2 sm:mb-0"
            >
              Año de servicio:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap justify-center mb-4 gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Crear Nuevo Grupo
            </button>
            {user?.uid === "5wyoaagTbJOyE6ybQlxjH5Ue8tX2" && (
              <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Eliminar Grupo
            </button>
            )}
          </div>

          <ul className="flex flex-wrap justify-center gap-4 gap-y-8">
            {grupos.map((grupo) => (
              <li key={grupo.id}>
                <Link
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded"
                  to={`/grupos/${congregacionId}/${grupo.id}`}
                  state={{ selectedYear }}
                >
                  {grupo.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Modal para añadir grupo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Nuevo Grupo</h3>
            <input
              type="text"
              placeholder="Nombre del grupo"
              maxLength={13}
              value={newGrupo}
              onChange={(e) => setNewGrupo(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGrupo}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar grupo */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl mb-4">Eliminar Grupo</h2>
            <select
              value={grupoToDelete}
              onChange={(e) => setGrupoToDelete(e.target.value)}
              className="border p-2 mb-4 w-full"
            >
              <option value="">Selecciona un grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeleteGrupo}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Eliminar
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal para añadir año */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Agregar Año</h3>
            <input
              type="number"
              placeholder="Año a agregar"
              value={yearToAdd}
              onChange={(e) => setYearToAdd(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowYearModal(false)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddYear} // Función para manejar la lógica de agregar el año
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Grupos;
