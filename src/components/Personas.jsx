/* eslint-disable react/prop-types */
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
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
  FaSearch,
} from "react-icons/fa";
import { SyncLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Papelera from "./Papelera";
import { IoClose } from "react-icons/io5";
import { VscOpenPreview } from "react-icons/vsc";
import { AnimatePresence, motion } from "framer-motion";
import { useDarkMode } from "../context/DarkModeContext";
import TutorialPersonas from "./TutorialPersonas";

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
  const { darkMode } = useDarkMode();
  const [showRegularModal, setShowRegularModal] = useState(false);
  const [regularStartDate, setRegularStartDate] = useState("");
  const [tempPersonaId, setTempPersonaId] = useState(null);
  const [regularDateUpdated, setRegularDateUpdated] = useState(false);

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
        const q = query(
          personasCollection,
          where(`registros.${selectedYear}.isDeleted`, "==", false)
        );
        const personasSnapshot = await getDocs(q);

        const personaList = personasSnapshot.docs.map((doc) => {
          const personaData = doc.data();
          const totalHorasPorAno = {};

          // Calcular total de horas por año con validación adicional
          Object.keys(personaData.registros || {}).forEach((year) => {
            const registrosPorAno = personaData.registros[year];
            // Solo considerar propiedades que son objetos y tienen la propiedad 'horas'
            const totalHoras = Object.values(registrosPorAno || {})
              .filter((registro) => registro && typeof registro === "object")
              .reduce((acc, registro) => {
                // Asegurarse de que 'horas' sea un número válido
                const horas = Number(registro.horas) || 0;
                return acc + horas;
              }, 0);
            totalHorasPorAno[year] = totalHoras;
          });

          return {
            id: doc.id,
            nombre: personaData.nombre,
            fechaNacimiento: personaData.fechaNacimiento,
            fechaBautismo: personaData.fechaBautismo,
            registros: personaData.registros || {},
            totalHorasPorAno,
            totalHoras: totalHorasPorAno[selectedYear] || 0,
          };
        });

        // Verificar si ya hay un Sup o Aux en la lista de personas
        const supExists = personaList.some(
          (persona) => persona.registros?.[selectedYear]?.rol === "Sup"
        );
        const auxExists = personaList.some(
          (persona) => persona.registros?.[selectedYear]?.rol === "Aux"
        );

        // Actualizar los estados de Sup y Aux
        setYaHaySup(supExists);
        setYaHayAux(auxExists);

        // Ordenar personas: Sup y Aux al principio
        const superintendente = personaList.filter(
          (persona) => persona.registros?.[selectedYear]?.rol === "Sup"
        );
        const auxiliar = personaList.filter(
          (persona) => persona.registros?.[selectedYear]?.rol === "Aux"
        );
        const miembros = personaList.filter(
          (persona) =>
            !["Sup", "Aux"].includes(persona.registros?.[selectedYear]?.rol)
        );

        // Establecer el estado con Sup y Aux al principio
        setPersonas([...superintendente, ...auxiliar, ...miembros]);
      } catch (error) {
        console.log("Error al obtener las tarjetas: ", error);
      } finally {
        setLoading(false);
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
      const personaRol = personaData.registros?.[selectedYear]?.rol;

      // Si la persona es Sup o Aux, verificar el grupo destino
      if (personaRol === "Sup" || personaRol === "Aux") {
        // Obtener todas las personas del grupo destino
        const destinationGroupRef = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          selectedGroup,
          "hermanos"
        );
        const destinationSnapshot = await getDocs(destinationGroupRef);

        // Verificar si ya existe un Sup o Aux en el grupo destino
        const hasSupOrAux = destinationSnapshot.docs.some((doc) => {
          const data = doc.data();
          const rol = data.registros?.[selectedYear]?.rol;
          return (
            (personaRol === "Sup" && rol === "Sup") ||
            (personaRol === "Aux" && rol === "Aux")
          );
        });

        if (hasSupOrAux) {
          toast.error(
            `No es posible mover la persona porque ya existe un ${
              personaRol === "Sup" ? "Superintendente" : "Auxiliar"
            } en el grupo destino.`,
            {
              position: "bottom-center",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              theme: darkMode ? "dark" : "light",
              style: {
                border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
              },
            }
          );
          setMoveLoading(false);
          return;
        }
      }

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
        toast.error("La persona ya existe en el grupo destino.", {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        });
        setMoveLoading(false);
        return;
      }

      // Preparar los datos para el nuevo documento
      const dataToMove = {
        nombre: personaData.nombre,
        fechaNacimiento: personaData.fechaNacimiento,
        fechaBautismo: personaData.fechaBautismo,
        registros: {
          [selectedYear]: {
            ...(personaData.registros?.[selectedYear] || {}),
            isDeleted: false,
          },
        },
      };

      // Agregar la persona al nuevo grupo
      await setDoc(newGrupoDocRef, dataToMove);

      // Eliminar la persona del grupo actual
      await deleteDoc(currentDocRef);

      toast.success(
        `Tarjeta movida al grupo exitosamente para el año ${selectedYear}.`,
        {
          position: "bottom-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
          style: {
            border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
          },
        }
      );

      // Actualizar la lista local
      setPersonas(personas.filter((persona) => persona.id !== movingPersonId));
      setMoveModalIsOpen(false);
    } catch (error) {
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para mover grupos. Por favor, contacta al supervisor.",
          {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          }
        );
      } else {
        toast.error(
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
          {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          }
        );
      }
    } finally {
      setMoveLoading(false);
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
            registros: {
              ...persona.registros,
              [selectedYear]: {
                ...(persona.registros[selectedYear] || {}),
                genero: {
                  ...(persona.registros[selectedYear]?.genero || {}),
                  [field]: value,
                },
              },
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

      // Global data
      const globalData = {
        nombre: persona.nombre || "",
        fechaNacimiento: persona.fechaNacimiento || "",
        fechaBautismo: persona.fechaBautismo || "",
        totalHorasPorAno: persona.totalHorasPorAno || {},
      };

      // Year-specific data
      const yearData = {
        [`registros.${selectedYear}`]: {
          ...(persona.registros?.[selectedYear] || {}),
          genero: persona.registros?.[selectedYear]?.genero || {},
          anciano: persona.registros?.[selectedYear]?.anciano || false,
          ministerial: persona.registros?.[selectedYear]?.ministerial || false,
          regular: persona.registros?.[selectedYear]?.regular || false,
          especial: persona.registros?.[selectedYear]?.especial || false,
          misionero: persona.registros?.[selectedYear]?.misionero || false,
        },
      };

      // Update in Firestore
      await updateDoc(personaRef, {
        ...globalData,
        ...yearData,
      });

      toast.success("Cambios guardados exitosamente.", {
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
    } catch (error) {
      // Verifica si el error es el relacionado con permisos insuficientes
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para guardar cambios. Por favor, contacta al supervisor.",
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
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
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

  // Función para agregar una nueva persona
  const agregarPersona = async () => {
    try {
      const id = nuevoNombre.replace(/\s+/g, "-").toLowerCase();

      // Verifica si ya hay un Sup o Aux en el grupo
      const yaHaySup = personas.some(
        (persona) => persona.registros?.[selectedYear]?.rol === "Sup"
      );
      const yaHayAux = personas.some(
        (persona) => persona.registros?.[selectedYear]?.rol === "Aux"
      );

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
        registros: {
          [selectedYear]: {
            genero: {},
            isDeleted: false,
            rol: rol || "Miembro",
            anciano: false,
            ministerial: false,
            regular: false,
            especial: false,
            misionero: false,
          },
        },
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
        theme: darkMode ? "dark" : "light",
        style: {
          border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
        },
      });

      setPersonas([...personas, { id, ...nuevaPersona }]);
      setModalIsOpen(false);
      setNuevoNombre("");
      setFechaNacimiento("");
      setFechaBautismo("");
      setNuevoRol("");
    } catch (error) {
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para agregar nuevas tarjetas. Por favor, contacta al supervisor.",
          {
            position: "bottom-center",
            autoClose: 5000,
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
      } else {
        toast.error(
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
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

  const handleDelete = async (id, nombre) => {
    try {
      // Mostrar un cuadro de confirmación antes de eliminar
      const result = await Swal.fire({
        title: `¿Estás seguro de eliminar a ${nombre}?`,
        text: "Se enviará a la papelera!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Sí, elimínalo",
        customClass: {
          popup: "swal-custom-popup",
        },
        didOpen: () => {
          const swalPopup = document.querySelector(".swal-custom-popup");
          if (swalPopup) {
            swalPopup.style.backgroundColor = darkMode ? "#303030" : "#ffffff";
            swalPopup.style.color = darkMode ? "#ffffff" : "#000000";
            swalPopup.style.border = darkMode ? "1px solid #ffffff" : "none";
          }
        },
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
        await updateDoc(personaDoc, {
          [`registros.${selectedYear}.isDeleted`]: true,
        });

        // Mostrar notificación de éxito
        toast.success("Tarjeta eliminada y movida a la papelera.", {
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

        // Actualizar el estado local para reflejar la eliminación
        setPersonas(personas.filter((persona) => persona.id !== id));
      }
    } catch (error) {
      // Verifica si el error es el relacionado con permisos insuficientes
      if (error.code === "permission-denied") {
        toast.error(
          "No tienes los permisos necesarios para eliminar tarjetas. Por favor, contacta al supervisor.",
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
          "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
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

  // Pasar value de Buscador de grupos al value del buscador de Personas
  useEffect(() => {
    // Si el state tiene un searchTerm, lo asignamos al campo de búsqueda
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

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

  // Add this function to handle role changes
  const handleRoleChange = async (personaId, field, value) => {
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
          return {
            ...persona,
            registros: {
              ...persona.registros,
              [selectedYear]: {
                ...(persona.registros[selectedYear] || {}),
                [field]: value,
              },
            },
          };
        }
        return persona;
      });

      setPersonas(updatedPersonas);

      // Update in Firestore
      await updateDoc(personaRef, {
        [`registros.${selectedYear}.${field}`]: value,
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Add this function to handle role changes
  const handleRolChange = async (personaId, newRol) => {
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

      await updateDoc(personaRef, {
        [`registros.${selectedYear}.rol`]: newRol,
      });

      // Actualizar el estado local
      setPersonas((prevPersonas) =>
        prevPersonas.map((p) => {
          if (p.id === personaId) {
            return {
              ...p,
              registros: {
                ...p.registros,
                [selectedYear]: {
                  ...p.registros[selectedYear],
                  rol: newRol,
                },
              },
            };
          }
          return p;
        })
      );

      // Actualizar estados de yaHaySup y yaHayAux
      const updatedPersonas = personas.map((p) =>
        p.id === personaId
          ? {
              ...p,
              registros: {
                ...p.registros,
                [selectedYear]: { ...p.registros[selectedYear], rol: newRol },
              },
            }
          : p
      );

      setYaHaySup(
        updatedPersonas.some((p) => p.registros?.[selectedYear]?.rol === "Sup")
      );
      setYaHayAux(
        updatedPersonas.some((p) => p.registros?.[selectedYear]?.rol === "Aux")
      );

      toast.success(`Rol actualizado exitosamente`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        theme: darkMode ? "dark" : "light",
      });
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      toast.error("Error al actualizar el rol", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        theme: darkMode ? "dark" : "light",
      });
    }
  };

  const RolButton = React.memo(
    ({ persona, selectedYear, onRolChange, personas }) => {
      const currentRol = persona.registros?.[selectedYear]?.rol;
      const { darkMode } = useDarkMode();
      const [yaHaySup, setYaHaySup] = useState(false);
      const [yaHayAux, setYaHayAux] = useState(false);
      const [rolesChecked, setRolesChecked] = useState(false);

      const checkExistingRoles = useMemo(() => {
        const hasSup = personas.some(
          (p) =>
            p.id !== persona.id && p.registros?.[selectedYear]?.rol === "Sup"
        );
        const hasAux = personas.some(
          (p) =>
            p.id !== persona.id && p.registros?.[selectedYear]?.rol === "Aux"
        );
        return { hasSup, hasAux };
      }, [personas, selectedYear, persona.id]); // Remove personas from dependencies

      useEffect(() => {
        setYaHaySup(checkExistingRoles.hasSup);
        setYaHayAux(checkExistingRoles.hasAux);
        setRolesChecked(true);
      }, [checkExistingRoles, rolesChecked]);

      const handleRolClick = useCallback(async () => {
        let newRol = null;
        let action = "";

        if (!currentRol || currentRol === "Miembro") {
          // Preparar las opciones disponibles
          const options = {};
          if (!yaHaySup) options["Sup"] = "Superintendente";
          if (!yaHayAux) options["Aux"] = "Auxiliar";

          // Si no hay roles disponibles, mostrar mensaje
          if (Object.keys(options).length === 0) {
            await Swal.fire({
              title: "No hay roles disponibles",
              text: "Ya existe un Superintendente y un Auxiliar en este grupo",
              icon: "info",
              confirmButtonText: "Aceptar",
              customClass: {
                popup: darkMode ? "swal-dark" : "",
              },
            });
            return;
          }

          // Mostrar opciones disponibles
          const result = await Swal.fire({
            title: `Seleccionar rol para ${persona.nombre}`,
            input: "select",
            inputOptions: options,
            inputPlaceholder: "Selecciona un rol",
            showCancelButton: true,
            confirmButtonText: "Asignar",
            cancelButtonText: "Cancelar",
            customClass: {
              popup: darkMode ? "swal-dark" : "",
            },
          });

          if (result.isConfirmed) {
            newRol = result.value;
            action = "asignar";
          }
        } else if (currentRol === "Sup" || currentRol === "Aux") {
          // Si ya tiene rol Sup o Aux, confirmar remover
          const result = await Swal.fire({
            title: `¿Deseas remover el cargo de ${
              currentRol === "Sup" ? "Superintendente" : "Auxiliar"
            } a ${persona.nombre}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar",
            customClass: {
              popup: darkMode ? "swal-dark" : "",
            },
          });

          if (result.isConfirmed) {
            action = "remover";
          }
        }

        if (action === "asignar" && newRol) {
          onRolChange(persona.id, newRol);
        } else if (action === "remover") {
          onRolChange(persona.id, "Miembro"); // Cambiar a "miembro" en lugar de null
        }
      }, [
        currentRol,
        darkMode,
        persona.nombre,
        persona.id,
        yaHaySup,
        yaHayAux,
        onRolChange,
      ]);

      // Si ya existen tanto Sup como Aux, no mostrar el botón
      if (yaHaySup && yaHayAux) {
        return null;
      }

      // Determinar el texto y estilo del botón
      let buttonText = "";
      let buttonClass = "";

      if (currentRol === "Sup" || currentRol === "Aux") {
        buttonText =
          currentRol === "Sup" ? "Remover Superintendente" : "Remover Auxiliar";
        buttonClass = "bg-red-500 hover:bg-red-700";
      } else {
        buttonText = "Asignar Sup/Aux";
        buttonClass = "bg-blue-500 hover:bg-blue-700";
      }

      return (
        <button
          onClick={handleRolClick}
          className={`${buttonClass} text-white text-md px-3 py-1 mb-1 rounded ml-0`}
        >
          {buttonText}
        </button>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison function for React.memo
      return (
        prevProps.persona.registros?.[prevProps.selectedYear]?.rol ===
          nextProps.persona.registros?.[nextProps.selectedYear]?.rol &&
        prevProps.selectedYear === nextProps.selectedYear &&
        prevProps.personas === nextProps.personas
      );
    }
  );

  // Add display name for debugging
  RolButton.displayName = "RolButton";

  const handleRegularPrecursorChange = (personaId, checked) => {
    if (checked) {
      setTempPersonaId(personaId);
      setShowRegularModal(true);
    } else {
      Promise.all([
        handleRoleChange(personaId, "regular", false),
        handleRoleChange(personaId, "regularStartDate", null),
        handleRoleChange(personaId, "regularStartMonth", null),
      ]).then(() => {
        setRegularDateUpdated(true); // Trigger the re-render
      });
    }
  };

  const handleRegularDateConfirm = () => {
    if (regularStartDate) {
      const date = new Date(regularStartDate + "T00:00:00");
      const month = date
        .toLocaleString("es-ES", { month: "long" })
        .toLowerCase();

      Promise.all([
        handleRoleChange(tempPersonaId, "regular", true),
        handleRoleChange(tempPersonaId, "regularStartDate", regularStartDate),
        handleRoleChange(tempPersonaId, "regularStartMonth", month),
      ]).then(() => {
        setShowRegularModal(false);
        setRegularStartDate("");
        setTempPersonaId(null);
        setRegularDateUpdated(true); // Trigger the re-render
      });
    }
  };

  useEffect(() => {
    if (regularDateUpdated) {
      const fetchPersonas = async () => {
        try {
          const personasRef = collection(
            db,
            "congregaciones",
            congregacionId,
            "grupos",
            grupoId,
            "hermanos"
          );
          const personasSnapshot = await getDocs(personasRef);
          const personasData = personasSnapshot.docs.map((doc) => {
            const personaData = doc.data();
            const totalHorasPorAno = {};

            // Calcular total de horas por año con validación adicional
            Object.keys(personaData.registros || {}).forEach((year) => {
              const registrosPorAno = personaData.registros[year];
              // Solo considerar propiedades que son objetos y tienen la propiedad 'horas'
              const totalHoras = Object.values(registrosPorAno || {})
                .filter((registro) => registro && typeof registro === "object")
                .reduce((acc, registro) => {
                  // Asegurarse de que 'horas' sea un número válido
                  const horas = Number(registro.horas) || 0;
                  return acc + horas;
                }, 0);
              totalHorasPorAno[year] = totalHoras;
            });

            return {
              id: doc.id,
              ...personaData,
              totalHorasPorAno,
              totalHoras: totalHorasPorAno[selectedYear] || 0,
            };
          });
          setPersonas(personasData);
        } catch (error) {
          console.error("Error fetching personas:", error);
        }
      };

      fetchPersonas();
      setRegularDateUpdated(false);
    }
  }, [regularDateUpdated, congregacionId, grupoId, selectedYear]);

  return (
    <>
      <ToastContainer />
      <div className="sm:sticky top-6 z-20 flex sm:w-full sm:mt-0 -mt-[32px] sm:justify-between sm:items-center justify-end pr-4 sm:pr-0 pb-3">
        <button
          onClick={() => navigate(-1)}
          className={`hidden sm:block shadow-lg border rounded-full p-3 mt-8 text-red-500 ${
            darkMode
              ? "bg-gray-800 border-white hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          } hover:scale-110`}
        >
          <FaArrowLeft size={24} />
        </button>
        {!loading && (
          <div className="sm:pt-8 hidden sm:block">
            <div className="">
              <Papelera />
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <SyncLoader color="#3B82F6" />
        </div>
      ) : (
        <>
          {!loading && (
            <div className="sm:pt-8 block sm:hidden z-10">
              <div className="papelera">
                <Papelera />
              </div>
            </div>
          )}
          <div
            className={`vista-previa sticky top-2 sm:top-14 mt-3 mb-2 z-10 sm:z-20
                ? "border-white"
                : "border-black"
            }`}
          >
            <Link
              to={`/${congregacionId}/grupos/${grupoId}/vistaPrevia`}
              state={{
                selectedYear,
                filterRegular,
                filterAnciano,
                filterMinisterial,
              }}
              className={`flex items-center gap-1 border bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-3 rounded shadow-lg ${
                darkMode ? "border-white" : "border-black"
              }`}
            >
              Vista Previa PDF
              <VscOpenPreview size={22} />
            </Link>
          </div>
          <div
            className={`sm:p-6 p-3 rounded-lg shadow-xl w-full relative mb-16 border ${
              darkMode
                ? "bg-[#303030] border-white text-white shadow-gray-600"
                : "bg-white border-black text-black"
            }`}
          >
            <TutorialPersonas />
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              Tarjetas de servicio {congregacionId} {"-"} {nombreGrupo} {"-"}{" "}
              {selectedYear}
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex gap-1 mb-4">
                <div className="buscar-tarjeta relative">
                  <FaSearch className="absolute left-3 top-2/4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Buscar tarjeta...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-black border border-blue-500 rounded-md pl-9 p-2 w-full sm:w-96"
                  />
                </div>
                {/* Botón de Filtros */}
                <div className="relative" ref={filterMenuRef}>
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="filtros bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  >
                    Filtros
                    <FaFilter />
                  </button>
                  {showFilterMenu && (
                    <div
                      className={`absolute right-0 mt-0 w-56 border border-gray-300 rounded-lg shadow-lg z-10 ${
                        darkMode
                          ? "bg-gray-800 border-white hover:bg-gray-700"
                          : "bg-white border-black hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex flex-col gap-1 p-4">
                        <label className="flex items-center">
                          <FaUsers className="mr-2 text-purple-500" />
                          <input
                            type="checkbox"
                            checked={filterAnciano}
                            onChange={(e) => setFilterAnciano(e.target.checked)}
                            className="mr-2"
                          />
                          Anciano
                        </label>
                        <label className="flex items-center">
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setModalIsOpen(true)}
                className="agregar-tarjeta bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center gap-2"
              >
                Agregar Tarjeta
                <FaPlus />
              </button>
            </div>
            <ul className="flex flex-col gap-4">
              {filteredPersonas.map((persona) => (
                <li
                  key={persona.id}
                  className={`border rounded-md ${
                    darkMode ? "border-white" : "border-gray-300"
                  }`}
                >
                  <div
                    onClick={() => toggleAccordion(persona.id)}
                    className={`cursor-pointer p-4 transition-colors rounded-t-md flex justify-between items-center gap-2 ${
                      darkMode
                        ? "bg-gray-800 border-white text-white hover:bg-gray-700"
                        : "bg-white border-black text-black hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <p className="text-lg text-left text-pretty font-medium">
                          {(persona.registros?.[selectedYear]?.rol === "Sup" ||
                            persona.registros?.[selectedYear]?.rol ===
                              "Aux") && (
                            <span>
                              ({persona.registros[selectedYear].rol}){" "}
                            </span>
                          )}
                          {persona.nombre}
                        </p>
                      </div>
                      {openId === persona.id ? (
                        <FaChevronUp className="text-blue-500" />
                      ) : (
                        <FaChevronDown className="text-blue-500" />
                      )}
                    </div>
                  </div>
                  {openId === persona.id && (
                    <div
                      className={`p-2 md:p-4 rounded-b-md flex flex-col gap-2 ${
                        darkMode
                          ? "bg-[#1f1f1f] text-white"
                          : "bg-gray-50 text-black"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 sm:gap-0">
                        <div className="flex flex-col items-start gap-1 sm:w-[315px] md:w-[415px]">
                          {/* Nombre */}
                          <RolButton
                            persona={persona}
                            selectedYear={selectedYear}
                            onRolChange={handleRolChange}
                            personas={personas}
                          />
                          <div className="flex items-center w-full lg:w-[480px]">
                            <label className="text-md font-bold">Nombre:</label>
                            <input
                              disabled
                              type="text"
                              placeholder="Perez Juan"
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
                          {/* Fecha de Nacimiento */}
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
                              className="text-black border border-gray-300 rounded-md p-1 ml-1 w-auto"
                            />
                          </div>
                          {/* Fecha de Bautismo */}
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
                              className="text-black border border-gray-300 rounded-md p-1 ml-1 w-auto"
                            />
                          </div>
                        </div>
                        <div className="font-bold flex flex-col items-start gap-1 mr-12">
                          {/* Hombre y mujer */}
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="checkbox"
                              checked={
                                persona.registros?.[selectedYear]?.genero
                                  ?.hombre || false
                              }
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
                              checked={
                                persona.registros?.[selectedYear]?.genero
                                  ?.mujer || false
                              }
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
                          {/* Otras ovejas y Ungido */}
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="checkbox"
                              checked={
                                persona.registros?.[selectedYear]?.genero
                                  ?.otrasOvejas || false
                              }
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
                              checked={
                                persona.registros?.[selectedYear]?.genero
                                  ?.ungido || false
                              }
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
                      <div className="font-bold flex flex-wrap sm:flex-row gap-y-2 items-start justify-between">
                        {/* Anciano */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={
                              persona.registros?.[selectedYear]?.anciano ||
                              false
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                persona.id,
                                "anciano",
                                e.target.checked
                              )
                            }
                          />
                          <span>Anciano</span>
                        </div>
                        {/* Ministerial */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={
                              persona.registros?.[selectedYear]?.ministerial ||
                              false
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                persona.id,
                                "ministerial",
                                e.target.checked
                              )
                            }
                          />
                          <span>Siervo Ministerial</span>
                        </div>
                        {/* Precursor Regular */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={
                              persona.registros?.[selectedYear]
                                ?.regularStartDate || false
                            }
                            onChange={(e) =>
                              handleRegularPrecursorChange(
                                persona.id,
                                e.target.checked
                              )
                            }
                          />
                          <span>Precursor Regular</span>
                          {persona.registros?.[selectedYear]
                            ?.regularStartDate && (
                            <span className="text-sm text-orange-500">
                              (Desde:{" "}
                              {new Date(
                                persona.registros[selectedYear]
                                  .regularStartDate + "T00:00:00"
                              ).toLocaleDateString()}
                              )
                            </span>
                          )}
                        </div>
                        {/* Precursor Especial */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={
                              persona.registros?.[selectedYear]?.especial ||
                              false
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                persona.id,
                                "especial",
                                e.target.checked
                              )
                            }
                          />
                          <span>Precursor Especial</span>
                        </div>
                        {/* Misionero */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={
                              persona.registros?.[selectedYear]?.misionero ||
                              false
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                persona.id,
                                "misionero",
                                e.target.checked
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
                            <tr className="text-sm leading-normal">
                              <th
                                className={`w-32 py-2 px-4 border font-bold ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Año de servicio <span>{selectedYear}</span>
                              </th>
                              <th
                                className={`py-2 px-4 w-28 border font-bold ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Participación en el ministerio
                              </th>
                              <th
                                className={`py-2 px-4 w-20 border font-bold ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Cursos Bíblicos
                              </th>
                              <th
                                className={`py-2 px-4 w-24 border font-bold ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Precursor Auxiliar
                              </th>
                              <th
                                className={`py-2 px-4 w-36 border font-bold ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Horas{" "}
                                <p>
                                  (Si es precursor o misionero que sirve en el
                                  campo)
                                </p>
                              </th>
                              <th
                                className={`py-2 px-4 w-72 border ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
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
                              <tr
                                key={mes}
                                className={`${
                                  darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
                                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                                </td>
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
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
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
                                  <input
                                    type="number"
                                    className="w-full text-black"
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
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
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
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
                                  <input
                                    type="number"
                                    className="w-full text-black"
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
                                <td
                                  className={`py-1 px-2 border whitespace-nowrap ${
                                    darkMode ? "border-white" : "border-black"
                                  }`}
                                >
                                  <input
                                    type="text"
                                    className="w-full text-black"
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
                            <tr
                              className={`font-bold text-center ${
                                darkMode
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <td
                                colSpan="4"
                                className={`text-right align-middle pb-2 ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                Total
                              </td>
                              <td
                                className={`border border-black whitespace-nowrap align-middle pb-2 ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                <span className="w-full block">
                                  {persona.totalHoras}
                                </span>
                              </td>
                              <td
                                className={`border border-black whitespace-nowrap align-middle pb-2 ${
                                  darkMode ? "border-white" : "border-black"
                                }`}
                              >
                                {/* Dejar vacío */}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-3">
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
                      <div className="my-3">
                        <Link
                          to={`/${congregacionId}/grupos/${grupoId}/${persona.id}`}
                          state={{ persona, selectedYear }}
                          className="bg-green-500 w-40 rounded-2xl py-3 px-6 text-white hover:bg-green-800"
                        >
                          Descargar PDF
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {/* Modal para mover persona */}
            {moveModalIsOpen && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={`flex flex-col border justify-center items-center rounded-lg py-6 px-12 max-w-md relative shadow-lg ${
                    darkMode
                      ? "bg-[#303030] border-white text-white"
                      : "bg-white border-black text-black"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
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
                        <IoClose
                          size={30}
                          className={`${
                            darkMode
                              ? "text-white border-white hover:text-red-500"
                              : "text-black border-black hover:text-red-500"
                          }`}
                        />
                      </button>
                      <h2 className="text-2xl font-semibold mb-4">
                        Seleccionar Nuevo Grupo
                      </h2>
                      <label className="block mb-2" htmlFor="group-select">
                        Del {nombreGrupo} a:
                      </label>
                      <div className="mb-4">
                        <select
                          id="group-select"
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 text-black"
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
                </motion.div>
              </motion.div>
            )}

            {/* Modal para agregar persona */}
            <AnimatePresence>
              {modalIsOpen && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`border flex flex-col gap-4 rounded-lg py-6 px-6 max-w-md relative shadow-lg ${
                      darkMode
                        ? "bg-[#1f1f1f] border-white text-white"
                        : "bg-white border-black text-black"
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      className="modal-close-button absolute top-4 right-4"
                      onClick={() => setModalIsOpen(false)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <IoClose
                        size={30}
                        className={`${
                          darkMode
                            ? "text-white border-white hover:text-red-500"
                            : "text-black border-black hover:text-red-500"
                        }`}
                      />
                    </motion.button>
                    <h2 className="text-xl font-semibold mb-4">
                      Agregar Nueva Tarjeta
                    </h2>
                    <form className="flex flex-col gap-4">
                      <label>
                        Nombre:
                        <input
                          type="text"
                          placeholder="Perez Juan"
                          value={nuevoNombre}
                          onChange={(e) => setNuevoNombre(e.target.value)}
                          className="text-black w-full border border-gray-400 p-2 rounded focus:outline-blue-500 transition-colors duration-200"
                        />
                      </label>
                      <label>
                        Fecha de Nacimiento:
                        <input
                          type="text"
                          placeholder="01/Enero/2000"
                          value={fechaNacimiento}
                          onChange={(e) => setFechaNacimiento(e.target.value)}
                          className="text-black w-full border border-gray-400 p-2 rounded focus:outline-blue-500 transition-colors duration-200"
                        />
                      </label>
                      <label>
                        Fecha de Bautismo:
                        <input
                          type="text"
                          placeholder="01/Enero/2000"
                          value={fechaBautismo}
                          onChange={(e) => setFechaBautismo(e.target.value)}
                          className="text-black w-full border border-gray-400 p-2 rounded focus:outline-blue-500 transition-colors duration-200"
                        />
                      </label>
                      {(!yaHaySup || !yaHayAux) && (
                        <label>
                          Rol:
                          <select
                            value={nuevoRol}
                            onChange={(e) => setNuevoRol(e.target.value)}
                            className="text-black border border-gray-300 p-2 rounded transition-colors duration-200"
                          >
                            <option value="">Selecciona un Rol</option>
                            {!personas.some(
                              (persona) =>
                                persona.registros?.[selectedYear]?.rol ===
                                  "Sup" &&
                                !persona.registros?.[selectedYear]?.isDeleted
                            ) && <option value="Sup">Superintendente</option>}
                            {!personas.some(
                              (persona) =>
                                persona.registros?.[selectedYear]?.rol ===
                                  "Aux" &&
                                !persona.registros?.[selectedYear]?.isDeleted
                            ) && <option value="Aux">Auxiliar</option>}
                          </select>
                        </label>
                      )}
                      <motion.button
                        type="button"
                        onClick={agregarPersona}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transform transition-transform duration-200 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Agregar
                      </motion.button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {showRegularModal && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={`border rounded-lg p-6 max-w-md relative shadow-lg ${
                    darkMode
                      ? "bg-[#1f1f1f] border-white text-white"
                      : "bg-white border-black text-black"
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <button
                    className="absolute top-4 right-4"
                    onClick={() => {
                      setShowRegularModal(false);
                      setRegularStartDate("");
                      setTempPersonaId(null);
                    }}
                  >
                    <IoClose size={30} className="hover:text-red-500" />
                  </button>

                  <h2 className="text-xl font-semibold mb-4">
                    Fecha de Inicio como Precursor Regular
                  </h2>

                  <div className="mb-4">
                    <input
                      type="date"
                      value={regularStartDate}
                      onChange={(e) => setRegularStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleRegularDateConfirm}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      disabled={!regularStartDate}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => {
                        setShowRegularModal(false);
                        setRegularStartDate("");
                        setTempPersonaId(null);
                      }}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Personas;
