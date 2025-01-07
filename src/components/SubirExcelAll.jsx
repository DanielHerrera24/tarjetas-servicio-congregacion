/* eslint-disable react/prop-types */
import { doc, setDoc } from "firebase/firestore"; // Importar Firestore
import * as XLSX from "xlsx"; // Importar la librería XLSX
import { toast } from "react-toastify";
import { useDarkMode } from "../context/DarkModeContext";
import { FaUpload } from "react-icons/fa";
import { useState } from "react";
import { SyncLoader } from "react-spinners";

const SubirExcel = ({ selectedYear, congregacionId, db }) => {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false); // Estado para el modal de carga

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validar que el nombre del archivo contenga el año seleccionado
      if (!file.name.includes(selectedYear)) {
        toast.error(
          `En el nombre del archivo debe incluir el mismo año que el año seleccionado: ${selectedYear}.`,
          {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
            progress: undefined,
            theme: darkMode ? "dark" : "light",
            style: {
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          }
        );
        return; // Detener el proceso si no contiene el año
      }

      setLoading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        try {
          // Iterar sobre cada hoja del archivo Excel
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet); // Convertir la hoja a JSON

            // Obtener el nombre del grupo del primer elemento de la hoja (si existe)
            const grupoNombre = jsonData[0]?.nombre || sheetName;

            // Subir los datos del grupo correspondiente
            for (const hermano of jsonData) {
              const hermanoId = hermano.ID; // Usar el ID del hermano desde el Excel
              const hermanoDocRef = doc(
                db,
                "congregaciones",
                congregacionId,
                "grupos",
                grupoNombre, // Usar el nombre del grupo como ID
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
                  } else if (campo === "PrecursorAux") {
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
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          });
          console.log("Si se pudo");
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
              border: darkMode ? "1px solid #ffffff" : "1px solid #000000",
            },
          });
          console.error("No se pudo:", error);
        } finally {
          setLoading(false); // Ocultar modal de carga
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

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`p-8 rounded border shadow-lg flex flex-col items-center ${
              darkMode
                ? "text-white border-white bg-black"
                : "text-black border-black bg-white"
            }`}
          >
            <p className="text-lg font-semibold mb-3">Subiendo archivo...</p>
            <SyncLoader color="#3B82F6" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubirExcel;
