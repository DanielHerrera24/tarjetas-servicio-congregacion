import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";
import { FaPlayCircle } from "react-icons/fa";

const TutorialPersonasExcel = () => {
  const [run, setRun] = useState(false);
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  // Define los pasos del tutorial
  const steps = [
    {
      target: ".descargar-excel",
      content:
        "Usa esta plantilla para poder llenar la información de las tarjetas de cada grupo. Sigue los ejemplos dentro de la plantilla.",
    },
    {
      target: ".copiar-ids",
      content:
        "Copia en tu portapapeles los IDs de todas tus tarjetas del grupo y pégalos en la plantilla de Excel. Este paso es ESCENCIAL para que la información se suba correctamente.",
    },
    {
      target: ".subir-excel",
      content:
      "Sube tu archivo de Excel que hayas llenado. Asegúrate de que toda la información esté correcta.",
    },
  ];

  // Verifica si el usuario ya vio el tutorial
  useEffect(() => {
    if (user) {
      const hasSeenTutorialPersonasExcel = localStorage.getItem(
        `hasSeenTutorialPersonasExcel_${user.uid}`
      );
      if (!hasSeenTutorialPersonasExcel) {
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
        localStorage.setItem(`hasSeenTutorialPersonasExcel_${user.uid}`, "true"); // Marca como visto
      }
    }
  };

  const handleStartTutorial = () => {
    setRun(true); // Activa el tutorial al hacer clic
  };

  return (
    <div>
      <button
        onClick={handleStartTutorial} // Activa el tutorial al hacer clic
        className="bg-orange-500 hover:bg-orange-700 flex items-center gap-2 text-white px-4 py-2 rounded font-semibold"
      >
        Ver Tutorial
        <FaPlayCircle />
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

export default TutorialPersonasExcel;
