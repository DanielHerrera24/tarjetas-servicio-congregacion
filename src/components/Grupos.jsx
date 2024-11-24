/* eslint-disable react-hooks/exhaustive-deps */
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
import { FaArrowLeft, FaUserCheck, FaUsers, FaUserTie } from "react-icons/fa";
import { SyncLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion"; // Importa Framer Motion
import { auth } from "../firebase";

function Grupos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal
  const [newGrupo, setNewGrupo] = useState(""); // Estado para manejar el nombre del nuevo grupo
  const [grupoToDelete, setGrupoToDelete] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año seleccionado
  const [years, setYears] = useState([]); // Lista de años
  const [yearToAdd, setYearToAdd] = useState(""); // Año a agregar
  const [showYearModal, setShowYearModal] = useState(false);
  const location = useLocation(); // Obtener el año desde la ubicación
  const { congregacionId } = useParams();
  const [counts, setCounts] = useState({
    precursores: 0,
    ministeriales: 0,
    ancianos: 0,
  });
  const [mostrarNombramientos, setMostrarNombramientos] = useState(false);
  const [nombramientoId, setNombramientoId] = useState("");

  if (auth.currentUser) {
    console.log("Usuario autenticado:", auth.currentUser);
    auth.currentUser
      .getIdTokenResult(true) // El parámetro 'true' forza la actualización del token
      .then((idTokenResult) => {
        const claims = idTokenResult.claims;
        console.log("Claims del usuario:", claims); // Verifica si 'congregacionId' está presente
        if (claims.congregacionId) {
          const congregacionId = claims.congregacionId;
          const groupsRef = collection(
            db,
            "congregaciones",
            congregacionId,
            "grupos"
          );
          getDocs(groupsRef)
            .then((querySnapshot) => {
              if (querySnapshot.empty) {
                console.log("No se encontraron grupos.");
              } else {
                querySnapshot.forEach((doc) => {
                  console.log("Grupo encontrado:", doc.data());
                });
              }
            })
            .catch((error) => {
              console.error("Error al obtener grupos:", error);
            });
        } else {
          console.error(
            "El usuario no tiene un Custom Claim para congregación."
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener el token:", error);
      });
  } else {
    console.log("Usuario no autenticado");
  }

  const fetchGrupos = async () => {
    try {
      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );
      const q = query(gruposCollection, orderBy("nombre", "asc"));
      const grupoSnapshot = await getDocs(q);
      const grupoList = grupoSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGrupos(grupoList);
    } catch (error) {
      console.error("Error al obtener los grupos:", error.message, error.code);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    setLoadingCounts(true);
    try {
      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );
      const gruposSnapshot = await getDocs(gruposCollection);

      let precursorCount = 0;
      let ministerialCount = 0;
      let ancianoCount = 0;

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
          if (hermanoData.regular) precursorCount++;
          if (hermanoData.ministerial) ministerialCount++;
          if (hermanoData.anciano) ancianoCount++;
        });
      }

      setCounts({
        precursores: precursorCount,
        ministeriales: ministerialCount,
        ancianos: ancianoCount,
      });
    } catch (error) {
      console.error("Error al contar hermanos:", error.message, error.code);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleMostrarNombramientos = () => {
    if (!mostrarNombramientos) {
      fetchCounts();
    }
    setMostrarNombramientos(!mostrarNombramientos);
  };

  const handleClick = (nombramiento) => {
    setNombramientoId(nombramiento); // Establece el valor correcto del nombramiento
    console.log(nombramientoId);
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

  const capitalizedCongregacionId =
    congregacionId.charAt(0).toUpperCase() + congregacionId.slice(1);

  return (
    <div className="flex flex-col gap-3 items-center">
      <ToastContainer />
      <button
        onClick={() => navigate(-1)}
        className="hidden sm:block absolute top-0 left-0 bg-white shadow-lg border border-black rounded-full p-3 text-red-500 hover:bg-gray-100 hover:scale-110"
      >
        <FaArrowLeft size={24} />
      </button>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <SyncLoader color="#3B82F6" />
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-semibold mb-2 -mt-2 text-black">
            Grupos congregación {capitalizedCongregacionId}
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-between mb-4"
          >
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
          </motion.div>
          {/* Botones para Crear y Eliminar Grupo */}
          <div className="flex flex-wrap justify-center mb-4 gap-4">
            <motion.button
              onClick={() => setShowModal(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Crear Nuevo Grupo
            </motion.button>
            {user?.uid === "5wyoaagTbJOyE6ybQlxjH5Ue8tX2" && (
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Eliminar Grupo
              </motion.button>
            )}
          </div>

          {/* Lista de Grupos con Animaciones */}
          <ul className="flex flex-wrap justify-center gap-2 sm:gap-4 sm:gap-y-8 gap-y-2">
            <AnimatePresence>
              {grupos.map((grupo) => (
                <motion.li
                  key={grupo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-300 rounded-md shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded"
                    to={`/${congregacionId}/grupos/${grupo.id}`}
                    state={{ selectedYear }}
                  >
                    {grupo.nombre}
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* Botón para Ver/Ocultar Nombramientos */}
          <div className="mt-2">
            <motion.button
              onClick={handleMostrarNombramientos}
              className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mostrarNombramientos
                ? "Ocultar Nombramientos"
                : "Ver Nombramientos"}
            </motion.button>

            {mostrarNombramientos &&
              (loadingCounts ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="p-8 bg-white shadow-md rounded-lg mt-4 flex items-center justify-center"
                >
                  <SyncLoader color="#3B82F6" />
                </motion.div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-lg shadow-md mt-4">
                    <h3 className="text-xl font-semibold mb-2 flex items-center">
                      Nombramientos:
                    </h3>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <FaUsers className="text-purple-500 mr-2" />
                        <p className="text-lg">
                          Ancianos:{" "}
                          <span className="font-bold">{counts.ancianos}</span>
                        </p>
                      </div>
                      <Link
                        to={`/${congregacionId}/nombramiento/anciano`}
                        state={{
                          nombramientoId: "anciano",
                          selectedYear: selectedYear,
                        }}
                        onClick={() => handleClick("anciano")} // Llamamos a la función para establecer el valor
                        className="flex bg-purple-500 hover:bg-purple-700 text-white px-3 py-1 rounded-lg"
                      >
                        Ver
                      </Link>
                    </div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <FaUserTie className="text-blue-500 mr-2" />
                        <p className="text-lg">
                          Siervos Ministeriales:{" "}
                          <span className="font-bold">
                            {counts.ministeriales}
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/${congregacionId}/nombramiento/ministerial`}
                        state={{
                          nombramientoId: "ministerial",
                          selectedYear: selectedYear,
                        }}
                        onClick={() => handleClick("ministerial")}
                        className="flex bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                      >
                        Ver
                      </Link>
                    </div>
                    <div className="flex justify-between gap-4">
                      <div className="flex items-center">
                        <FaUserCheck className="text-yellow-500 mr-2" />
                        <p className="text-lg">
                          Precursores Regulares:{" "}
                          <span className="font-bold">
                            {counts.precursores}
                          </span>
                        </p>
                      </div>
                      <Link
                        to={`/${congregacionId}/nombramiento/regular`}
                        state={{
                          nombramientoId: "regular",
                          selectedYear: selectedYear,
                        }}
                        onClick={() => handleClick("regular")}
                        className="flex bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                </>
              ))}
          </div>
        </>
      )}

      {/* Modal para añadir grupo */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className="text-xl font-semibold mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Nuevo Grupo
              </motion.h3>
              <input
                type="text"
                placeholder="Grupo 1"
                maxLength={13}
                value={newGrupo}
                onChange={(e) => setNewGrupo(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              />
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleAddGrupo}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Crear
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para Eliminar Grupo con Animaciones */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-4 rounded-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2
                className="text-xl mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Eliminar Grupo
              </motion.h2>
              <select
                value={grupoToDelete}
                onChange={(e) => setGrupoToDelete(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              >
                <option value="">Selecciona un grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombre}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleDeleteGrupo}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Eliminar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para añadir año */}
      <AnimatePresence>
        {showYearModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className="text-xl font-semibold mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Agregar Año
              </motion.h3>
              <input
                type="number"
                placeholder="Año a agregar"
                value={yearToAdd}
                onChange={(e) => setYearToAdd(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              />
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowYearModal(false)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleAddYear}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Agregar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Grupos;
