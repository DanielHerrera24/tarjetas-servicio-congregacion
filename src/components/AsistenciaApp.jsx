import { useState } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWhatsapp } from "react-icons/fa";
import TutorialAsistencia from "./TutorialAsistencia";

function AsistenciaApp() {
  const [mensajes, setMensajes] = useState([]);
  const [filteredMensajes, setFilteredMensajes] = useState([]);
  const [selectedYear, setSelectedYear] = useState(""); // Estado para el año seleccionado
  const [selectedMonth, setSelectedMonth] = useState(""); // Estado para el mes seleccionado
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();

  // Función para procesar el archivo subido
  const procesarArchivo = (contenido) => {
    const regex =
      /(\d{1,2}\/\d{1,2}\/\d{4}),.*?-\s(.*?):\s([\s\S]+?)(?=\n\d{1,2}\/\d{1,2}\/\d{4}|$)/g;
    const resultados = [];

    let match;
    while ((match = regex.exec(contenido)) !== null) {
      const [, fecha, usuario, mensaje] = match;
      if (
        mensaje.toLowerCase().includes("asistencia") ||
        mensaje.toLowerCase().includes("total") ||
        mensaje.toLowerCase().includes("asistente")
      ) {
        resultados.push({ fecha, usuario, mensaje: mensaje.trim() });
      }
    }

    setMensajes(resultados);
    setFilteredMensajes(resultados); // Inicialmente mostramos todos los mensajes
  };

  // Manejar la carga del archivo
  const manejarCargaArchivo = (event) => {
    const archivo = event.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (e) => {
        const contenido = e.target.result;
        procesarArchivo(contenido);
      };
      lector.readAsText(archivo);
    }
  };

  // Filtrar mensajes por año y mes
  const filtrarPorAnioYMes = (year, month) => {
    let mensajesFiltrados = mensajes;

    if (year) {
      mensajesFiltrados = mensajesFiltrados.filter(
        (mensaje) => mensaje.fecha.includes(year) // Filtramos por año
      );
    }

    if (month) {
      mensajesFiltrados = mensajesFiltrados.filter((mensaje) => {
        const monthFromDate = mensaje.fecha.split("/")[1]; // Obtener el mes de la fecha
        return monthFromDate === month; // Filtrar por mes
      });
    }

    setFilteredMensajes(mensajesFiltrados);
  };

  // Nombres de los meses
  const nombresMeses = [
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

  // Obtener los meses únicos y ordenarlos de Enero a Diciembre
  const mesesUnicosOrdenados = mensajes
    .map((mensaje) => mensaje.fecha.split("/")[1]) // Extraer meses de las fechas
    .filter((value, index, self) => self.indexOf(value) === index) // Eliminar duplicados
    .sort((a, b) => a - b); // Ordenar de Enero a Diciembre

  const obtenerClasePorDia = (fecha) => {
    const [day, month, year] = fecha.split("/");
    const dayOfWeek = new Date(`${month}/${day}/${year}`).getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return darkMode ? "bg-orange-600" : "bg-orange-200"; // Fines de semana
    }
    return darkMode ? "bg-green-600" : "bg-green-200"; // Entre semana
  };

  const obtenerNombreDia = (fecha) => {
    const [day, month, year] = fecha.split("/");
    const date = new Date(`${month}/${day}/${year}`);
    const nombresDias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return nombresDias[date.getDay()]; // Obtiene el nombre del día según el índice
  };

  return (
    <div
      className={`p-4 mb-6 relative flex flex-col items-center gap-4 ${
        darkMode
          ? "bg-[#303030] text-white shadow-gray-600"
          : "bg-[#f3f3f3] text-black"
      }`}
    >
      <div>
        <button
          onClick={() => navigate(-1)}
          className={`hidden sm:block sm:absolute -left-20 top-0 shadow-lg border rounded-full p-3 mt-0 text-red-500 ${
            darkMode
              ? "bg-gray-800 border-white hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          } hover:scale-110`}
        >
          <FaArrowLeft size={24} />
        </button>
      </div>
      <h1 className="text-2xl font-bold">Registro de Asistencias</h1>

      <div className="absolute top-20 left-0">
        <TutorialAsistencia />
      </div>
      {/* Carga de archivo */}
      <input
        id="subir-chat"
        type="file"
        accept=".txt"
        onChange={manejarCargaArchivo}
        className="hidden"
      />

      {/* Botón personalizado */}
      <label
        htmlFor="subir-chat" // Vincula el botón con el input
        className="subir-chat bg-green-500 text-white flex items-center justify-center w-36 gap-2 px-4 py-2 rounded-md cursor-pointer hover:bg-green-700"
      >
        Subir Chat
        <FaWhatsapp color="white" />
      </label>

      {/* Filtro por año */}
      <div className="filtro-año">
        <label htmlFor="year" className="mr-2">
          Filtrar por año:
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            filtrarPorAnioYMes(e.target.value, selectedMonth); // Filtrar por año y mes
          }}
          className="p-2 border border-blue-500 rounded text-black"
        >
          <option value="">Todos los años</option>
          {mensajes
            .map((mensaje) => mensaje.fecha.split("/")[2]) // Extraer años de las fechas
            .filter((value, index, self) => self.indexOf(value) === index) // Eliminar duplicados
            .map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
        </select>
      </div>

      {/* Filtro por mes */}
      <div className="filtro-mes">
        <label htmlFor="month" className="mr-2">
          Filtrar por mes:
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            filtrarPorAnioYMes(selectedYear, e.target.value); // Filtrar por mes y año
          }}
          className="p-2 border border-blue-500 rounded text-black"
        >
          <option value="">Todos los meses</option>
          {mesesUnicosOrdenados.map((month, index) => (
            <option key={index} value={month}>
              {nombresMeses[parseInt(month) - 1]} {/* Mostrar nombre del mes */}
            </option>
          ))}
        </select>
      </div>

      {/* Leyenda de colores */}
      <div>
        <p className="text-sm text-left">
          <span
            className={`inline-block border w-4 h-4 mr-2 ${
              darkMode
                ? "bg-orange-600 border-white"
                : "bg-orange-200 border-black"
            }`}
          ></span>
          Fines de semana
        </p>
        <p className="text-sm text-left">
          <span
            className={`inline-block border w-4 h-4 mr-2 ${
              darkMode
                ? "bg-green-600 border-white"
                : "bg-green-200 border-black"
            }`}
          ></span>
          Días entre semana
        </p>
      </div>

      {/* Mostrar resultados */}
      {filteredMensajes.length > 0 ? (
        <div className="overflow-x-auto max-w-[700px]">
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <th className="border border-gray-400 p-2">Fecha</th>
                <th className="border border-gray-400 p-2">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {filteredMensajes.map((mensaje, index) => (
                <tr key={index} className={obtenerClasePorDia(mensaje.fecha)}>
                  <td className="border border-gray-400 p-2 text-sm">
                    {mensaje.fecha}
                    <div className="text-xs">
                      {obtenerNombreDia(mensaje.fecha)}
                    </div>{" "}
                    {/* Mostrar el nombre del día */}
                  </td>
                  <td className="border border-gray-400 p-2 text-sm">
                    {mensaje.mensaje}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4">Carga un archivo para procesar los mensajes.</p>
      )}
    </div>
  );
}

export default AsistenciaApp;
