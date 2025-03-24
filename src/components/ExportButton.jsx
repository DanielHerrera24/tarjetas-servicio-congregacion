import { FaFileExcel } from 'react-icons/fa';
import { exportToExcel } from './ExportToExcel'; // Asegúrate de importar el archivo correctamente

const ExportButton = () => {
  const handleExport = async () => {
    try {
      await exportToExcel(); // Llamar a la función que exporta los datos
      alert("Datos exportados correctamente a Excel.");
    } catch (error) {
      console.error("Error al exportar los datos:", error);
      alert("Hubo un problema al exportar los datos.");
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 bg-green-400 hover:bg-green-600 py-2 px-4 rounded">
      <FaFileExcel /><button onClick={handleExport}>Exportar a Excel</button>
    </div>
  );
};

export default ExportButton;
