import { useDarkMode } from "../context/DarkModeContext";

/* eslint-disable react/prop-types */
function Footer({ onOpenPrivacyModal }) {
  const { darkMode } = useDarkMode();

  return (
    <footer
      className={`bg-gray-800 py-2 text-center w-full sm:sticky -bottom-20 left-0 border-t xl:border-x ${
        darkMode
          ? "bg-gray-800 border-white"
          : "bg-gray-200 border-black"
      }`}
    >
      <p className="text-sm">
        © {new Date().getFullYear()} GestSur. Todos los derechos reservados.
      </p>
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
