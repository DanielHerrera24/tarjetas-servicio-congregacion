/* eslint-disable react/prop-types */
import { IoClose } from "react-icons/io5";
import { useDarkMode } from "../context/DarkModeContext";

const Modal = ({ children, onClose }) => {
  const { darkMode } = useDarkMode();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-lg max-h-[80vh] p-6 rounded shadow-lg relative overflow-y-scroll ${
          darkMode
            ? "bg-[#1f1f1f] border-white shadow-slate-600"
            : "bg-white border-black"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2"
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
        {children}
      </div>
    </div>
  );
};

export default Modal;
