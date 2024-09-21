import { useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import "./modal.css";
import {
  FaFilter,
  FaPlus,
  FaUserCheck,
  FaUserTie,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
} from "react-icons/fa";
import { SyncLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Papelera from "./Papelera";
import { IoClose } from "react-icons/io5";
import { VscOpenPreview } from "react-icons/vsc";

Modal.setAppElement("#root");

function Personas() {
  const navigate = useNavigate();
  const { grupoId, congregacionId } = useParams();
  const [personas, setPersonas] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [moveModalIsOpen, setMoveModalIsOpen] = useState(false); // Nuevo estado para el modal de mover personas
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaBautismo, setFechaBautismo] = useState("");
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [loading, setLoading] = useState(true);
  const [moveLoading, setMoveLoading] = useState(false);
  const [grupos, setGrupos] = useState([]); // Lista de grupos para seleccionar
  const [selectedGroup, setSelectedGroup] = useState(""); // Grupo seleccionado para mover la persona
  const [movingPersonId, setMovingPersonId] = useState(null); // ID de la persona a mover
  const location = useLocation();
  const { selectedYear } = location.state || {}; // Obtiene el año seleccionado
  const [nuevoRol, setNuevoRol] = useState("");
  const [yaHaySup, setYaHaySup] = useState(false);
  const [yaHayAux, setYaHayAux] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterRegular, setFilterRegular] = useState(false);
  const [filterMinisterial, setFilterMinisterial] = useState(false);
  const [filterAnciano, setFilterAnciano] = useState(false);
  const filterMenuRef = useRef(null); // Referencia para el menú de filtros

  useEffect(() => {
    if (!grupoId) {
      console.error("El ID del grupo no está definido.");
      return;
    }

    const fetchGrupoNombre = async () => {
      try {
        const grupoDoc = await getDoc(
          doc(db, "congregaciones", congregacionId, "grupos", grupoId)
        );
        if (grupoDoc.exists()) {
          setNombreGrupo(grupoDoc.data().nombre);
        } else {
          console.error("El grupo no existe.");
        }
      } catch (error) {
        console.log("Error al obtener el nombre del grupo: ", error);
      }
    };

    const fetchPersonas = async () => {
      try {
        const personasCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoId,
          "hermanos"
        );

        // Crear una consulta para solo obtener personas no eliminadas
        const q = query(personasCollection, where("isDeleted", "==", false));
        const personasSnapshot = await getDocs(q);

        const personaList = personasSnapshot.docs.map((doc) => {
          const personaData = doc.data();
          const totalHorasPorAno = {};

          // Calcular total de horas por año
          Object.keys(personaData.registros || {}).forEach((year) => {
            const registrosPorAno = personaData.registros[year];
            const totalHoras = Object.values(registrosPorAno).reduce(
              (acc, registro) => acc + (registro.horas || 0),
              0
            );
            totalHorasPorAno[year] = totalHoras;
          });

          return {
            id: doc.id,
            ...personaData,
            genero: personaData.genero || {},
            registros: personaData.registros || {},
            totalHorasPorAno: totalHorasPorAno, // Añade totalHorasPorAno al objeto de la persona
            totalHoras: totalHorasPorAno[selectedYear] || "", // Obtén el totalHoras del año seleccionado
          };
        });

        // Verificar si ya hay un Sup o Aux en la lista de personas
        const supExists = personaList.some((persona) => persona.rol === "Sup");
        const auxExists = personaList.some((persona) => persona.rol === "Aux");

        // Actualizar los estados de Sup y Aux
        setYaHaySup(supExists);
        setYaHayAux(auxExists);

        // Ordenar personas: Sup y Aux al principio
        const superintendente = personaList.filter(
          (persona) => persona.rol === "Sup"
        );
        const auxiliar = personaList.filter((persona) => persona.rol === "Aux");
        const miembros = personaList.filter(
          (persona) => !["Sup", "Aux"].includes(persona.rol)
        );

        // Establecer el estado con Sup y Aux al principio
        setPersonas([...superintendente, ...auxiliar, ...miembros]);
      } catch (error) {
        console.log("Error al obtener las tarjetas: ", error);
      } finally {
        setLoading(false); // Termina el loading cuando los datos se han cargado
      }
    };

    const fetchGrupos = async () => {
      try {
        const gruposCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos"
        );
        const gruposSnapshot = await getDocs(gruposCollection);
        const grupoList = gruposSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGrupos(grupoList);
      } catch (error) {
        console.log("Error al obtener los grupos: ", error);
      }
    };

    fetchGrupos();
    fetchGrupoNombre();
    fetchPersonas();
  }, [grupoId, selectedYear, congregacionId, yaHaySup, yaHayAux]); // Asegúrate de incluir selectedYear en las dependencias

  const handleMovePerson = async () => {
    if (!selectedGroup || !movingPersonId) {
      console.error("No se ha seleccionado ningún grupo o persona.");
      return;
    }

    setMoveLoading(true);

    try {
      // Verificar si la persona existe en el grupo actual
      const currentDocRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoId,
        "hermanos",
        movingPersonId
      );
      const currentDocSnap = await getDoc(currentDocRef);
      if (!currentDocSnap.exists()) {
        console.error(
          "El documento de la persona no existe en el grupo actual."
        );
        setMoveLoading(false);
        return;
      }

      const personaData = currentDocSnap.data();

      // Verificar si el grupo destino existe
      const newGrupoDocRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        selectedGroup,
        "hermanos",
        movingPersonId
      );
      const newGrupoDocSnap = await getDoc(newGrupoDocRef);
      if (newGrupoDocSnap.exists()) {
        console.error("La persona ya existe en el grupo destino.");
        setMoveLoading(false);
        return;
      }

      // Agregar la persona al nuevo grupo
      await setDoc(newGrupoDocRef, personaData);

      // Eliminar la persona del grupo actual
      await deleteDoc(currentDocRef);

      toast.success(`Tarjeta movida al ${selectedGroup} exitosamente.`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setPersonas(personas.filter((persona) => persona.id !== movingPersonId)); // Actualizar la lista local
      setMoveModalIsOpen(false); // Cierra el modal de mover persona
    } catch (error) {
      console.log("Error al mover la persona: ", error);
    } finally {
      setMoveLoading(false); // Termina el estado de carga
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = async (personaId, campoOMes, tipo, value) => {
    try {
      const personaRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoId,
        "hermanos",
        personaId
      );

      const updatedPersonas = personas.map((persona) => {
        if (persona.id === personaId) {
          // Si el tipo es un campo general (nombre, fechaNacimiento, fechaBautismo)
          if (
            tipo === "nombre" ||
            tipo === "fechaNacimiento" ||
            tipo === "fechaBautismo"
          ) {
            return {
              ...persona,
              [tipo]: value, // Actualiza el campo general
            };
          } else {
            // Si el tipo es parte del registro mensual
            const updatedRegistros = {
              ...(persona.registros || {}),
              [selectedYear]: {
                ...(persona.registros[selectedYear] || {}),
                [campoOMes]: {
                  ...((persona.registros[selectedYear] || {})[campoOMes] || {}),
                  [tipo]:
                    tipo === "cursos" || tipo === "horas"
                      ? parseFloat(value) || 0 // Convierte el valor a número
                      : value, // Mantén el valor para otros campos
                },
              },
            };

            // Cálculo del total de horas
            const totalHoras = Object.values(
              updatedRegistros[selectedYear] || {}
            ).reduce((acc, registro) => acc + (registro.horas || 0), 0);

            return {
              ...persona,
              registros: updatedRegistros, // Actualiza registros
              totalHoras, // Actualiza el total de horas
            };
          }
        }
        return persona;
      });

      // Actualiza el estado de personas localmente
      setPersonas(updatedPersonas);

      // Actualiza en Firestore
      if (
        tipo === "nombre" ||
        tipo === "fechaNacimiento" ||
        tipo === "fechaBautismo"
      ) {
        // Actualiza un campo general
        await updateDoc(personaRef, {
          [tipo]: value,
        });
      } else {
        // Actualiza los registros mensuales en Firestore
        await updateDoc(personaRef, {
          [`registros.${selectedYear}`]: updatedPersonas.find(
            (p) => p.id === personaId
          ).registros[selectedYear],
          [`totalHorasPorAño.${selectedYear}`]: updatedPersonas.find(
            (p) => p.id === personaId
          ).totalHoras,
        });
      }
    } catch (error) {
      console.log("Error al actualizar la información: ", error);
    }
  };

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id); // Alternar entre abrir y cerrar el acordeón
  };

  // Función para manejar los cambios en los checkboxes generales
  const handleCheckboxChange = (personaId, field, value) => {
    setPersonas(
      personas.map((persona) => {
        if (persona.id === personaId) {
          return {
            ...persona,
            genero: {
              ...persona.genero,
              [field]: value,
            },
          };
        }
        return persona;
      })
    );
  };

  // Función para guardar los cambios en Firebase
  const saveChanges = async (personaId) => {
    try {
      const persona = personas.find((p) => p.id === personaId);
      const personaRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoId,
        "hermanos",
        personaId
      );

      // Asegúrate de que todos los campos estén definidos y actualizados
      await updateDoc(personaRef, {
        nombre: persona.nombre || "",
        fechaNacimiento: persona.fechaNacimiento || "",
        fechaBautismo: persona.fechaBautismo || "",
        genero: persona.genero,
        anciano: persona.anciano || false,
        ministerial: persona.ministerial || false,
        regular: persona.regular || false,
        especial: persona.especial || false,
        misionero: persona.misionero || false,
        registros: {
          ...persona.registros,
          [selectedYear]: persona.registros[selectedYear] || {},
        },
        [`totalHorasPorAño.${selectedYear}`]: persona.totalHoras || 0,
      });

      toast.success("Cambios guardados exitosamente.", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.error("Error al guardar los cambios: ", error);
    }
  };

  // Función para agregar una nueva persona
  const agregarPersona = async () => {
    try {
      const id = nuevoNombre.replace(/\s+/g, "-").toLowerCase(); // Reemplaza espacios por guiones y convierte a minúsculas

      // Verifica si ya hay un Sup o Aux en el grupo
      const yaHaySup = personas.some((persona) => persona.rol === "Sup");
      const yaHayAux = personas.some((persona) => persona.rol === "Aux");

      // Si el rol no es Sup ni Aux, será Miembro automáticamente
      let rol = "";
      if (nuevoRol === "Sup" && !yaHaySup) {
        rol = "Sup";
      } else if (nuevoRol === "Aux" && !yaHayAux) {
        rol = "Aux";
      }

      const nuevaPersona = {
        nombre: nuevoNombre,
        fechaNacimiento: fechaNacimiento,
        fechaBautismo: fechaBautismo,
        genero: {},
        registros: {},
        isDeleted: false,
        rol: rol || "Miembro", // Si no es Sup o Aux, será Miembro
      };

      const newDocRef = doc(
        db,
        "congregaciones",
        congregacionId,
        "grupos",
        grupoId,
        "hermanos",
        id
      );
      await setDoc(newDocRef, nuevaPersona);

      toast.success("Tarjeta agregada exitosamente", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      setPersonas([...personas, { id, ...nuevaPersona }]);
      setModalIsOpen(false);
      setNuevoNombre("");
      setFechaNacimiento("");
      setFechaBautismo("");
      setNuevoRol(""); // Reiniciar el rol al cerrar el modal
    } catch (error) {
      console.error("Error al agregar tarjeta: ", error);
    }
  };

  const handleDelete = async (id, nombre) => {
    try {
      // Mostrar un cuadro de confirmación antes de eliminar
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar a ${nombre}?`,
        text: "No podrás revertir los cambios!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Sí, elimínalo",
      });

      if (result.isConfirmed) {
        // Marcar la persona como eliminada en Firestore
        const personaDoc = doc(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoId,
          "hermanos",
          id
        );
        await updateDoc(personaDoc, { isDeleted: true });

        // Mostrar notificación de éxito
        toast.success("Tarjeta eliminada y movida a la papelera.", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        // Actualizar el estado local para reflejar la eliminación
        setPersonas(personas.filter((persona) => persona.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar la tarjeta: ", error);

      // Mostrar notificación de error
      toast.error(
        "Error al eliminar la tarjeta. Por favor, intenta de nuevo.",
        {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  const filteredPersonas = personas.filter((persona) => {
    const matchSearchTerm = persona.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchRegular = filterRegular ? persona.regular === true : true;
    const matchMinisterial = filterMinisterial
      ? persona.ministerial === true
      : true;
    const matchAnciano = filterAnciano ? persona.anciano === true : true;

    // Devolver solo las personas que cumplen con todos los filtros
    return matchSearchTerm && matchRegular && matchMinisterial && matchAnciano;
  });

  // Manejar clics fuera del menú de filtros
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // Agregar listener para dispositivos táctiles

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside); // Limpiar el listener
    };
  }, [filterMenuRef]);

  return (
    <>
      <ToastContainer />
      <div className="sm:sticky top-6 z-20 flex sm:w-full sm:mt-0 -mt-[32px] sm:justify-between sm:items-center justify-end pr-4 sm:pr-0 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="hidden sm:block bg-white shadow-lg border border-black rounded-full p-3 mt-8 text-red-500"
        >
          <FaArrowLeft size={24} />
        </button>
        {!loading && <Papelera />}
      </div>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <SyncLoader color="#3B82F6" />
        </div>
      ) : (
        <>
          <div className="bg-white sticky top-2 sm:top-14 px-3 py-2 mt-3 shadow-lg rounded-xl mb-2 z-10">
            <Link
              to={`/grupos/${congregacionId}/${grupoId}/vistaPrevia`}
              state={{ selectedYear }}
              className="flex items-center gap-3 bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded shadow-lg"
            >
              Vista Previa PDF
              <VscOpenPreview size={22} />
            </Link>
          </div>
          <div className="sm:p-6 p-3 bg-white rounded-lg shadow-md w-full relative mb-16">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
              Tarjetas de servicio {congregacionId} {"-"} {nombreGrupo} {"-"}{" "}
              {selectedYear}
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Buscar tarjeta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-blue-500 rounded-md p-2 mb-4 w-full sm:w-96"
                />
                {/* Botón de Filtros */}
                <div className="relative" ref={filterMenuRef}>
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  >
                    Filtros
                    <FaFilter />
                  </button>
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-0 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <div className="p-4">
                        <label className="flex items-center">
                          <FaUserCheck className="mr-2 text-yellow-500" />
                          <input
                            type="checkbox"
                            checked={filterRegular}
                            onChange={(e) => setFilterRegular(e.target.checked)}
                            className="mr-2"
                          />
                          Precursor Regular
                        </label>
                        <label className="flex items-center mt-2">
                          <FaUserTie className="mr-2 text-blue-500" />
                          <input
                            type="checkbox"
                            checked={filterMinisterial}
                            onChange={(e) =>
                              setFilterMinisterial(e.target.checked)
                            }
                            className="mr-2"
                          />
                          Siervo Ministerial
                        </label>
                        <label className="flex items-center mt-2">
                          <FaUsers className="mr-2 text-purple-500" />
                          <input
                            type="checkbox"
                            checked={filterAnciano}
                            onChange={(e) => setFilterAnciano(e.target.checked)}
                            className="mr-2"
                          />
                          Anciano
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setModalIsOpen(true)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center gap-2"
              >
                Agregar Tarjeta
                <FaPlus />
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              {filteredPersonas.map((persona) => (
                <li
                  key={persona.id}
                  className="border border-gray-300 rounded-md"
                >
                  <div
                    onClick={() => toggleAccordion(persona.id)}
                    className="cursor-pointer p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-t-md flex justify-between items-center gap-2"
                  >
                    <p className="text-lg text-left text-pretty font-medium text-gray-800">
                      {(persona.rol === "Sup" || persona.rol === "Aux") && (
                        <span>({persona.rol}) </span>
                      )}
                      {persona.nombre}
                    </p>
                    {openId === persona.id ? (
                      <FaChevronUp className="text-blue-500" />
                    ) : (
                      <FaChevronDown className="text-blue-500" />
                    )}
                  </div>
                  {openId === persona.id && (
                    <div className="p-2 md:p-4 bg-gray-50 rounded-b-md flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 sm:gap-0">
                        <div className="flex flex-col items-start gap-1 sm:w-[315px] md:w-[415px]">
                          <div className="flex items-center w-full lg:w-[480px]">
                            <label className="text-md font-bold">Nombre:</label>
                            <input
                              type="text"
                              placeholder="Juan Perez"
                              value={persona.nombre}
                              onChange={(e) =>
                                handleInputChange(
                                  persona.id,
                                  null,
                                  "nombre",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md p-1 ml-1 w-full"
                            />
                          </div>
                          <div className="flex items-center w-full">
                            <label className="text-md font-bold">
                              Fecha de Nacimiento:
                            </label>
                            <input
                              type="text"
                              placeholder="01/Enero/2000"
                              value={persona.fechaNacimiento}
                              onChange={(e) =>
                                handleInputChange(
                                  persona.id,
                                  null,
                                  "fechaNacimiento",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md p-1 ml-1 w-auto"
                            />
                          </div>
                          <div className="flex items-center w-full">
                            <label className="text-md font-bold">
                              Fecha de Bautismo:
                            </label>
                            <input
                              type="text"
                              placeholder="01/Enero/2000"
                              value={persona.fechaBautismo}
                              onChange={(e) =>
                                handleInputChange(
                                  persona.id,
                                  null,
                                  "fechaBautismo",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded-md p-1 ml-1 w-auto"
                            />
                          </div>
                        </div>
                        <div className="text-black font-bold flex flex-col items-start gap-1 mr-12">
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="checkbox"
                              checked={persona.genero?.hombre || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  persona.id,
                                  "hombre",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="mr-10">Hombre</span>
                            <input
                              type="checkbox"
                              checked={persona.genero?.mujer || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  persona.id,
                                  "mujer",
                                  e.target.checked
                                )
                              }
                            />
                            <span>Mujer</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="checkbox"
                              checked={persona.genero?.otrasOvejas || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  persona.id,
                                  "otrasOvejas",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="mr-2">Otras Ovejas</span>
                            <input
                              type="checkbox"
                              checked={persona.genero?.ungido || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  persona.id,
                                  "ungido",
                                  e.target.checked
                                )
                              }
                            />
                            <span>Ungido</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-black font-bold flex flex-wrap sm:flex-row gap-y-2 items-start justify-between">
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={persona.anciano || false}
                            onChange={(e) =>
                              setPersonas(
                                personas.map((p) =>
                                  p.id === persona.id
                                    ? { ...p, anciano: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          <span>Anciano</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={persona.ministerial || false}
                            onChange={(e) =>
                              setPersonas(
                                personas.map((p) =>
                                  p.id === persona.id
                                    ? { ...p, ministerial: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          <span>Siervo Ministerial</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={persona.regular || false}
                            onChange={(e) =>
                              setPersonas(
                                personas.map((p) =>
                                  p.id === persona.id
                                    ? { ...p, regular: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          <span>Precursor Regular</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={persona.especial || false}
                            onChange={(e) =>
                              setPersonas(
                                personas.map((p) =>
                                  p.id === persona.id
                                    ? { ...p, especial: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          <span>Precursor Especial</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={persona.misionero || false}
                            onChange={(e) =>
                              setPersonas(
                                personas.map((p) =>
                                  p.id === persona.id
                                    ? { ...p, misionero: e.target.checked }
                                    : p
                                )
                              )
                            }
                          />
                          <span className="w-32 sm:w-36">
                            Misionero que sirve en el campo
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: ".9rem",
                          }}
                          className="sm:min-w-full min-w-[900px]"
                        >
                          <thead>
                            <tr className="text-black text-sm leading-normal">
                              <th className="w-32 py-2 px-4 border border-black font-bold">
                                Año de servicio <div>{selectedYear}</div>
                              </th>
                              <th className="py-2 px-4 w-28 border border-black font-bold">
                                Participación en el ministerio
                              </th>
                              <th className="py-2 px-4 w-20 border border-black font-bold">
                                Cursos Bíblicos
                              </th>
                              <th className="py-2 px-4 w-24 border border-black font-bold">
                                Precursor Auxiliar
                              </th>
                              <th className="py-2 px-4 w-36 border border-black font-bold">
                                Horas{" "}
                                <div>
                                  (Si es precursor o misionero que sirve en el
                                  campo)
                                </div>
                              </th>
                              <th className="py-2 px-4 w-72 border border-black">
                                Notas
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              "septiembre",
                              "octubre",
                              "noviembre",
                              "diciembre",
                              "enero",
                              "febrero",
                              "marzo",
                              "abril",
                              "mayo",
                              "junio",
                              "julio",
                              "agosto",
                            ].map((mes) => (
                              <tr key={mes} className="hover:bg-gray-100">
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                                </td>
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={
                                      persona.registros?.[selectedYear]?.[mes]
                                        ?.participacion || false
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        persona.id,
                                        mes,
                                        "participacion",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  <input
                                    type="number"
                                    className="w-full"
                                    value={
                                      persona.registros?.[selectedYear]?.[mes]
                                        ?.cursos || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        persona.id,
                                        mes,
                                        "cursos",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={
                                      persona.registros?.[selectedYear]?.[mes]
                                        ?.precursor || false
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        persona.id,
                                        mes,
                                        "precursor",
                                        e.target.checked
                                      )
                                    }
                                  />
                                </td>
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  <input
                                    type="number"
                                    className="w-full"
                                    value={
                                      persona.registros?.[selectedYear]?.[mes]
                                        ?.horas || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        persona.id,
                                        mes,
                                        "horas",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td className="py-1 px-2 border border-black whitespace-nowrap">
                                  <input
                                    type="text"
                                    className="w-full"
                                    value={
                                      persona.registros?.[selectedYear]?.[mes]
                                        ?.notas || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        persona.id,
                                        mes,
                                        "notas",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                            {/* Fila adicional para Totales */}
                            <tr className="font-bold text-center text-black">
                              <td
                                colSpan="4"
                                className="text-right align-middle pb-2"
                              >
                                Total
                              </td>
                              <td className="border border-black whitespace-nowrap align-middle pb-2">
                                <span className="w-full block">
                                  {persona.totalHoras}
                                </span>
                              </td>
                              <td className="border border-black whitespace-nowrap align-middle pb-2">
                                {/* Dejar vacío */}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-center gap-2 m-3">
                        <button
                          className="bg-blue-500 w-40 rounded-2xl py-2 text-white hover:bg-blue-800"
                          onClick={() => saveChanges(persona.id)}
                        >
                          Guardar Cambios
                        </button>
                        <button
                          className="bg-orange-500 w-40 rounded-2xl py-2 text-white hover:bg-orange-800"
                          onClick={() => {
                            setMovingPersonId(persona.id);
                            setMoveModalIsOpen(true); // Abre el nuevo modal
                          }}
                        >
                          Mover de Grupo
                        </button>
                        <button
                          className="bg-red-500 w-40 rounded-2xl py-2 text-white hover:bg-red-800"
                          onClick={() =>
                            handleDelete(persona.id, persona.nombre)
                          }
                        >
                          Eliminar Tarjeta
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {/* Modal para mover persona */}
            {moveModalIsOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="flex flex-col justify-center items-center bg-white rounded-lg py-6 px-12 max-w-md relative shadow-lg transition-transform transform scale-100">
                  {moveLoading ? (
                    <div className="flex justify-center items-center w-20 h-24">
                      <SyncLoader color="#3B82F6" />
                    </div>
                  ) : (
                    <>
                      <button
                        className="modal-close-button absolute top-4 right-4"
                        onClick={() => setMoveModalIsOpen(false)}
                      >
                        <IoClose />
                      </button>
                      <h2 className="text-2xl font-semibold mb-4">
                        Seleccionar Nuevo Grupo
                      </h2>
                      <label
                        className="block text-gray-700 mb-2"
                        htmlFor="group-select"
                      >
                        Del {grupoId} a:
                      </label>
                      <div className="mb-4">
                        <select
                          id="group-select"
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          <option value="">Seleccionar Grupo</option>
                          {grupos.map((grupo) => (
                            <option key={grupo.id} value={grupo.id}>
                              {grupo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleMovePerson}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setMoveModalIsOpen(false)}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Modal para agregar persona */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={() => setModalIsOpen(false)}
              className="modal"
              overlayClassName="modal-overlay"
              closeTimeoutMS={200}
            >
              <h2 className="text-xl font-semibold mb-4">
                Agregar Nueva Tarjeta
              </h2>
              <button
                className="modal-close-button"
                onClick={() => setModalIsOpen(false)}
              >
                <IoClose size={30} />
              </button>
              <form className="flex flex-col gap-4 text-black">
                <label>
                  Nombre:
                  <input
                    type="text"
                    placeholder="Juan Perez"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-blue-500"
                  />
                </label>
                <label>
                  Fecha de Nacimiento:
                  <input
                    type="text"
                    placeholder="01/Enero/2000"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-blue-500"
                  />
                </label>
                <label>
                  Fecha de Bautismo:
                  <input
                    type="text"
                    placeholder="01/Enero/2000"
                    value={fechaBautismo}
                    onChange={(e) => setFechaBautismo(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-blue-500"
                  />
                </label>
                {(!yaHaySup || !yaHayAux) && (
                  <label>
                    Rol:
                    <select
                      value={nuevoRol}
                      onChange={(e) => setNuevoRol(e.target.value)}
                      className="border border-gray-300 p-2 rounded"
                    >
                      <option value="">Selecciona un Rol</option>
                      {!yaHaySup && (
                        <option value="Sup">Superintendente</option>
                      )}
                      {!yaHayAux && <option value="Aux">Auxiliar</option>}
                    </select>
                  </label>
                )}
                <button
                  type="button"
                  onClick={agregarPersona}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Agregar
                </button>
              </form>
            </Modal>
          </div>
        </>
      )}
    </>
  );
}

export default Personas;
