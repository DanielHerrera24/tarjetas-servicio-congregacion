import { useState } from "react";
import Joyride from "react-joyride";
import { useDarkMode } from "../context/DarkModeContext";

const Tutorial = () => {
  const [run, setRun] = useState(true);
  const { darkMode } = useDarkMode();

  // Define los pasos del tutorial
  const steps = [
    {
      target: ".añadir-año",
      content:
        "Aquí puedes añadir el año de servicio que deseas. ¡Ojo! El año de servicio se agregará a todas las tarjetas que estén creadas actualmente.",
    },
    {
      target: ".año-de-servicio",
      content:
        "Usa este campo para seleccionar el año de servicio que deseas ver en las tarjetas.",
    },
    {
      target: ".crear-grupo",
      content:
        "Usa este botón para crear un nuevo grupo. (El nombre del grupo tiene que ser como el del ejemplo).",
    },
    {
      target: ".eliminar-grupo",
      content:
        "Usa este botón para eliminar un grupo ¡Cuidado! Esta acción es irreversible.",
    },
    {
      target: ".nombramientos",
      content:
        "Aquí podrás ver cuántos nombramientos tienes registrados en todas tus tarjetas. (Anciano, Siervo ministerial y Precursor regular). También podrás ver una vista previa de todas las tarjetas de cada nombramiento para poder descargar en PDF posteriormente.",
    },
  ];

  // Maneja la finalización o eventos del tutorial
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false); // Detiene el tutorial si se completa o se salta
    }
  };

  const handleStartTutorial = () => {
    setRun(true); // Activa el tutorial al hacer clic
  };

  return (
    <div>
      <button
        onClick={handleStartTutorial} // Activa el tutorial al hacer clic
        className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold"
      >
        Ver Tutorial
      </button>

      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep
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

export default Tutorial;
