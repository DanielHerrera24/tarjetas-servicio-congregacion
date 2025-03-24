import { db } from "../firebase"; // Asegúrate de importar tu archivo de configuración Firebase
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx"; // Librería para exportar el Excel

// Función para exportar los datos de Firebase a Excel
export async function exportToExcel() {
  const congregacionesRef = collection(db, "congregaciones");
  const congregacionesSnapshot = await getDocs(congregacionesRef);
  const workbook = XLSX.utils.book_new();

  for (const congregacionDoc of congregacionesSnapshot.docs) {
    const congregacionId = congregacionDoc.id;
    const gruposRef = collection(congregacionDoc.ref, "grupos");
    const gruposSnapshot = await getDocs(gruposRef);

    for (const grupoDoc of gruposSnapshot.docs) {
      const grupoId = grupoDoc.id;
      const hermanosRef = collection(grupoDoc.ref, "hermanos");
      const hermanosSnapshot = await getDocs(hermanosRef);

      const hermanosData = [];
      let allMonthsSet = new Set();

      // Primero recorremos los datos para identificar todas las columnas necesarias
      hermanosSnapshot.docs.forEach((hermanoDoc) => {
        const hermanoData = hermanoDoc.data();
        const registros = hermanoData.registros || {};

        // Recorremos los registros para obtener todos los meses y años posibles
        Object.entries(registros).forEach(([año, meses]) => {
          Object.keys(meses).forEach((mes) => {
            allMonthsSet.add(`${año}_${mes}`);
          });
        });
      });

      // Convertimos el Set en un array ordenado por año y mes
      const allMonths = Array.from(allMonthsSet).sort((a, b) => {
        const [añoA, mesA] = a.split("_");
        const [añoB, mesB] = b.split("_");
        return añoA - añoB || getMonthIndex(mesA) - getMonthIndex(mesB);
      });

      // Recorremos nuevamente los datos para estructurar la información
      for (const hermanoDoc of hermanosSnapshot.docs) {
        const hermanoId = hermanoDoc.id;
        const hermanoData = hermanoDoc.data();
        const registros = hermanoData.registros || {};

        // Datos generales del hermano
        const hermanoInfo = {
          hermanoId,
          nombre: hermanoData.nombre,
          fechaBautismo: hermanoData.fechaBautismo,
          fechaNacimiento: hermanoData.fechaNacimiento,
          totalHorasPorAño: JSON.stringify(hermanoData.totalHorasPorAño || {}),
          isDeleted: hermanoData.isDeleted || false,
        };

        // Agregar registros mensuales en las columnas correspondientes
        allMonths.forEach((mesCompleto) => {
          const [año, mes] = mesCompleto.split("_");
          const datosMes = registros[año]?.[mes] || {};

          hermanoInfo[`${mes}_${año}_Participó`] = datosMes.participacion
            ? "si"
            : "no";
          hermanoInfo[`${mes}_${año}_Estudios`] = datosMes.cursos || 0;
          hermanoInfo[`${mes}_${año}_PrecursorAux`] = datosMes.precursor
            ? "si"
            : "no";
          hermanoInfo[`${mes}_${año}_Horas`] = datosMes.horas || 0;
          hermanoInfo[`${mes}_${año}_Notas`] = datosMes.notas || "";
        });

        // Agregar la fila a los datos del grupo
        hermanosData.push(hermanoInfo);
      }

      // Crear la hoja de trabajo con los datos del grupo
      const worksheet = XLSX.utils.json_to_sheet(hermanosData);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        `${congregacionId}_${grupoId}`
      );
    }
  }

  // Guardar el archivo Excel
  const filePath = "./datos_migrados.xlsx";
  XLSX.writeFile(workbook, filePath);

  console.log(`Los datos han sido exportados a ${filePath}`);
}

// Función para obtener el índice del mes para ordenarlo correctamente
function getMonthIndex(mes) {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return meses.indexOf(mes.toLowerCase());
}
