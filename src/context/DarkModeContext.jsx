/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => {
  return useContext(DarkModeContext);
};

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const body = document.body;

    if (darkMode) {
      body.classList.add("bg-[#1F1F1F]", "text-white");
      body.classList.remove("bg-white", "text-black");
    } else {
      body.classList.add("bg-white", "text-black");
      body.classList.remove("bg-[#1F1F1F]", "text-white");
    }
  }, [darkMode]); // Ejecuta cada vez que darkMode cambie

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
