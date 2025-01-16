/* eslint-disable react/prop-types */
function Footer({ onOpenPrivacyModal }) {
  return (
    <footer className="bg-gray-800 text-white py-2 text-center w-full fixed bottom-0 left-0">
      <p className="text-sm">
        © {new Date().getFullYear()} GestSur. Todos los derechos reservados.
      </p>
      <button
        onClick={onOpenPrivacyModal}
        className="text-blue-400 hover:underline"
      >
        Aviso de Privacidad
      </button>
    </footer>
  );
}

export default Footer;
