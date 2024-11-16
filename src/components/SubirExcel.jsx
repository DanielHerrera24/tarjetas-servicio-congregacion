/* eslint-disable react/prop-types */
import { doc, setDoc } from "firebase/firestore"; // Importar Firestore
import * as XLSX from "xlsx"; // Importar la librería XLSX

const SubirExcel = ({ selectedYear, congregacionId, grupoId, db }) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      // Extraer el mes del nombre del archivo
      const fileName = file.name.toLowerCase();
      const mesMatch = fileName.match(
        /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/
      );
      const mes = mesMatch ? mesMatch[0] : null;

      if (!mes) {
        alert("El nombre del archivo no contiene un mes válido.");
        return;
      }

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
            const nuevoRegistro = {
              [selectedYear]: {
                [mes]: {
                  cursos: parseInt(hermano.Estudios, 10) || 0,
                  horas: parseInt(hermano.Horas, 10) || 0,
                  participacion: hermano.Participó === "Si",
                  precursor: hermano.Precursor === "Si",
                  notas: hermano.Notas || "",
                },
              },
            };

            // Subir los datos al campo "registros" en Firebase
            await setDoc(
              hermanoDocRef,
              { registros: nuevoRegistro },
              { merge: true } // Usar merge para no sobrescribir datos existentes
            );
          }

          alert("Datos subidos correctamente a Firebase");
        } catch (error) {
          console.error("Error al subir los datos:", error);
          alert("Hubo un error al subir los datos");
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="file-upload"
        className="block text-sm font-bold text-black"
      >
        Subir archivo de Excel por mes
      </label>
      <div className="mt-2">
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="file:bg-purple-500 file:text-white file:px-3 file:py-1 file:rounded-md file:hover:bg-purple-700 file:cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SubirExcel;
