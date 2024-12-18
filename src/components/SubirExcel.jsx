/* eslint-disable react/prop-types */
/* eslint-disable react/prop-types */
import { doc, setDoc } from "firebase/firestore"; // Importar Firestore
import * as XLSX from "xlsx"; // Importar la librería XLSX
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";
import { FaUpload } from "react-icons/fa";

const SubirExcel = ({ selectedYear, congregacionId, grupoId, db }) => {
  const { darkMode } = useDarkMode();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Usar la primera hoja de cálculo
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); // Convertir la hoja a JSON

        try {
          // Iterar sobre los datos y subirlos a Firebase
          for (const hermano of jsonData) {
            const hermanoId = hermano.ID; // Usar el ID del hermano desde el Excel
            const hermanoDocRef = doc(
              db,
              "congregaciones",
              congregacionId,
              "grupos",
              grupoId,
              "hermanos",
              hermanoId
            );

            // Preparar la estructura de los datos para el campo "registros"
            const nuevoRegistro = { [selectedYear]: {} };

            // Iterar sobre las claves del hermano para procesar cada mes
            Object.keys(hermano).forEach((key) => {
              if (key.includes("_")) {
                const [mes, campo] = key.split("_"); // Separar mes y tipo de campo
                const mesLowerCase = mes.toLowerCase();

                // Asegurarse de que el mes ya exista en la estructura
                if (!nuevoRegistro[selectedYear][mesLowerCase]) {
                  nuevoRegistro[selectedYear][mesLowerCase] = {
                    cursos: 0,
                    horas: 0,
                    participacion: false,
                    precursor: false,
                    notas: "",
                  };
                }

                // Asignar los valores correspondientes
                if (campo === "Participó") {
                  nuevoRegistro[selectedYear][mesLowerCase].participacion =
                    hermano[key] === "Si";
                } else if (campo === "Estudios") {
                  nuevoRegistro[selectedYear][mesLowerCase].cursos =
                    parseInt(hermano[key], 10) || 0;
                } else if (campo === "Precursor") {
                  nuevoRegistro[selectedYear][mesLowerCase].precursor =
                    hermano[key] === "Si";
                } else if (campo === "Horas") {
                  nuevoRegistro[selectedYear][mesLowerCase].horas =
                    parseInt(hermano[key], 10) || 0;
                } else if (campo === "Notas") {
                  nuevoRegistro[selectedYear][mesLowerCase].notas =
                    hermano[key] || "";
                }
              }
            });

            // Subir los datos al campo "registros" en Firebase
            await setDoc(
              hermanoDocRef,
              { registros: nuevoRegistro },
              { merge: true } // Usar merge para no sobrescribir datos existentes
            );
          }

          toast.success(`Archivo de Excel subido correctamente.`, {
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
          toast.error(`No se pudo subir el archivo de Excel: ${error}`, {
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
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="flex justify-center">
      <input
        id="file-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="hidden" // Oculta el input
      />

      {/* Botón personalizado */}
      <label
        htmlFor="file-upload" // Vincula el botón con el input
        className="bg-purple-500 text-white flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-purple-700"
      >
        Subir Excel
        <FaUpload />
      </label>
    </div>
  );
};

export default SubirExcel;
