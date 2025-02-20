import { useDarkMode } from "../context/DarkModeContext";

/* eslint-disable react/prop-types */
function Footer({ onOpenPrivacyModal }) {
  const { darkMode } = useDarkMode();

  return (
    <footer
      className={`py-2 text-center w-full sm:sticky -bottom-20 left-0 border-t xl:border-x ${
        darkMode
          ? "bg-gray-800 border-white"
          : "bg-gray-200 border-black"
      }`}
    >
      <button
        onClick={onOpenPrivacyModal}
        className="text-blue-500 hover:underline"
      >
        Aviso de Privacidad
      </button>
    </footer>
  );
}

export default Footer;
