import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { FaQuestionCircle } from "react-icons/fa";

const TutorialPersonas = () => {
  const [run, setRun] = useState(false);
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  // Define los pasos del tutorial
  const steps = [
    {
      target: ".agregar-tarjeta",
      content:
        "Crea una nueva tarjeta, solo necesitas: Nombre, fecha de nacimiento y bautismo. Además, puedes asignar al Superintendente y Auxiliar de ese grupo",
    },
    {
      target: ".buscar-tarjeta",
      content: "Busca tarjetas por nombre.",
    },
    {
      target: ".filtros",
      content:
        "Filtra por nombramientos (Anciano, Siervo Ministerial y Precursor Regular).",
    },
    {
      target: ".papelera",
      content:
        "Aquí se van las tarjetas que elimines, puedes restaurarlas con la información que tenían o eliminarlas permanentemente.",
    },
    {
      target: ".vista-previa",
      content:
        "Este botón te manda a una sección para mirar todas las tarjetas existentes del grupo y posteriormente descargar en PDF.",
    },
  ];

  // Verifica si el usuario ya vio el tutorial
  useEffect(() => {
    if (user) {
      const hasSeenTutorialPersonas = localStorage.getItem(
        `hasSeenTutorialPersonas_${user.uid}`
      );
      if (!hasSeenTutorialPersonas) {
        setRun(true); // Inicia el tutorial automáticamente la primera vez
      }
    }
  }, [user]);

  // Maneja la finalización o eventos del tutorial
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false); // Detiene el tutorial
      if (user) {
        localStorage.setItem(`hasSeenTutorialPersonas_${user.uid}`, "true"); // Marca como visto
      }
    }
  };

  const handleStartTutorial = () => {
    setRun(true); // Activa el tutorial al hacer clic
  };

  return (
    <div className="absolute -top-[52px] left-0">
      <button
        onClick={handleStartTutorial} // Activa el tutorial al hacer clic
        className="bg-orange-500 hover:bg-orange-700 flex items-center gap-2 text-white px-2 py-2 rounded font-semibold"
      >
        <FaQuestionCircle size={25} />
      </button>

      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep={false}
        disableScrolling={true}
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          back: "Volver", // Texto del botón de "Anterior"
          close: "Cerrar", // Texto del botón de "Cerrar"
          last: "Finalizar", // Texto del botón de "Finalizar"
          next: "Siguiente", // Texto del botón de "Siguiente"
          skip: "Saltar", // Texto del botón de "Saltar"
        }}
        styles={{
          options: {
            zIndex: 1000,
            backgroundColor: darkMode ? "#303030" : "#f3f3f3", // Fondo dinámico
            textColor: darkMode ? "#ffffff" : "#000000", // Color del texto
            primaryColor: darkMode ? "#ffffff" : "#000000", // Color principal
          },
          tooltip: {
            backgroundColor: darkMode ? "#424242" : "#ffffff", // Fondo del tooltip
            color: darkMode ? "#ffffff" : "#000000", // Texto del tooltip
            borderRadius: "8px",
            border: `1px solid ${darkMode ? "#ffffff" : "#000000"}`,
            boxShadow: darkMode
              ? "0 8px 10px rgba(100, 100, 100, 0.5)"
              : "0 8px 10px rgba(0, 0, 0, 0.4)", // Sombra dinámica
          },
          buttonNext: {
            backgroundColor: darkMode ? "#2c94ea" : "#2c94ea", // Botón Siguiente
            color: "#ffffff",
          },
          buttonBack: {
            color: darkMode ? "#f1f1f1" : "#000000", // Botón Atrás
          },
          buttonSkip: {
            color: darkMode ? "#d0d0d0" : "#000000", // Botón Saltar
          },
        }}
      />
    </div>
  );
};

export default TutorialPersonas;
