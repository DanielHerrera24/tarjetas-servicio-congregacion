import { useDarkMode } from "../context/DarkModeContext";

/* eslint-disable react/prop-types */
function RoleInfoModal({ isOpen, onClose }) {
  const { darkMode } = useDarkMode();

  if (!isOpen) return null;

  const rolesInfo = {
    Administrador:
      "Tiene acceso completo al sistema, incluyendo gestión de usuarios y roles.",
    Gestor:
      "Puede gestionar todas las tarjetas, pero no tiene la opción de Accesos para dar acceso a nuevos usuarios ni asignar roles.",
    Editor:
      "Puede crear y modificar contenido, pero no puede añadir año de servicio, ni subir información, ni eliminar grupos, ni eliminar tarjetas permanentemente.",
    Espectador:
      "Tiene acceso solo para ver información, sin permisos para realizar cambios en toda la aplicación.",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
      <div
        className={`p-6 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 border ${
          darkMode
            ? "bg-[#303030] text-white shadow-gray-600 border-white"
            : "bg-[#f3f3f3] text-black border-black"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Información de Roles</h2>
        <ul className="space-y-3">
          {Object.entries(rolesInfo).map(([role, description]) => (
            <li key={role} className="border-b border-gray-500 pb-2">
              <p
                className={`font-semibold text-xl ${
                  role === "Administrador"
                    ? "text-red-500"
                    : role === "Gestor"
                    ? "text-blue-500"
                    : role === "Editor"
                    ? "text-green-500"
                    : role === "Espectador"
                    ? "text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {role}
              </p>
              <p className="text-sm">{description}</p>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default RoleInfoModal;
