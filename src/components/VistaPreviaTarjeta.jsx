import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "../App.css";
import { FaArrowLeft, FaFileDownload } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";

function VistaPreviaTarjeta() {
  const navigate = useNavigate();
  const location = useLocation();
  const persona = location.state?.persona || {};
  const selectedYear = location.state?.selectedYear;
  const { darkMode } = useDarkMode();

  const generatePDF = () => {
    const element = document.getElementById("content-to-print");
    const opt = {
      margin: [0.2, 0.1, 0.2, 0.1],
      filename: `Tarjeta ${persona.nombre} ${selectedYear}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className={`hidden sm:block absolute top-2 left-2 shadow-lg border rounded-full p-3 text-red-500 hover:scale-110 ${
          darkMode
            ? "bg-gray-800 border-white hover:bg-gray-700"
            : "bg-white border-black hover:bg-gray-100"
        } hover:scale-110`}
      >
        <FaArrowLeft size={24} /> {/* Flecha hacia atrás */}
      </button>
      <div
        className={`border sticky top-0 sm:mt-0 -mt-16 sm:top-12 px-3 py-2 shadow-xl rounded-xl z-20 ${
          darkMode
            ? "bg-gray-800 border-white hover:bg-gray-700"
            : "bg-white border-black hover:bg-gray-100"
        }`}
      >
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded shadow-lg transform transition-transform duration-200"
        >
          Descargar en PDF
          <FaFileDownload />
        </button>
      </div>
      <div
        id="content-to-print"
        className="w-full max-w-[1024px] my-0 px-1 text-black bg-white"
      >
        <div className="flex justify-center mb-3">
          <h2 className="font-bold text-xl">
            REGISTRO DE PUBLICADOR DE LA CONGREGACIÓN
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 sm:gap-0">
          <div className="flex flex-col items-start">
            <p className="text-sm text-black">
              <span className="text-black font-bold">Nombre:</span>{" "}
              {persona.nombre}
            </p>
            <p className="text-sm text-black">
              <span className="text-black font-bold">Fecha de Nacimiento:</span>{" "}
              {persona.fechaNacimiento}
            </p>
            <p className="text-sm text-black">
              <span className="text-black font-bold">Fecha de Bautismo:</span>{" "}
              {persona.fechaBautismo}
            </p>
          </div>
          <div className="font-bold flex flex-col items-start mr-14">
            <div className="flex flex-wrap gap-1">
              <input
                type="checkbox"
                checked={persona.genero?.hombre || false}
                readOnly
                className="mt-3"
              />
              <label className="mr-[61px]">Hombre</label>
              <input
                type="checkbox"
                checked={persona.genero?.mujer || false}
                readOnly
                className="mt-3"
              />
              <label>Mujer</label>
            </div>
            <div className="flex flex-wrap gap-1">
              <input
                type="checkbox"
                checked={persona.genero?.otrasOvejas || false}
                readOnly
                className="mt-3"
              />
              <label className="mr-7">Otras Ovejas</label>
              <input
                type="checkbox"
                checked={persona.genero?.ungido || false}
                readOnly
                className="mt-3"
              />
              <label>Ungido</label>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-between font-bold">
          <div className="flex gap-1 items-start">
            <input
              type="checkbox"
              checked={persona.anciano || false}
              readOnly
              className="mt-3"
            />
            <label>Anciano</label>
          </div>
          <div className="flex gap-1 items-start">
            <input
              type="checkbox"
              checked={persona.ministerial || false}
              readOnly
              className="mt-3"
            />
            <label>Siervo Ministerial</label>
          </div>
          <div className="flex gap-1 items-start">
            <input
              type="checkbox"
              checked={persona.regular || false}
              readOnly
              className="mt-3"
            />
            <label>Precursor Regular</label>
          </div>
          <div className="flex gap-1 items-start">
            <input
              type="checkbox"
              checked={persona.especial || false}
              readOnly
              className="mt-3"
            />
            <label>Precursor Especial</label>
          </div>
          <div className="flex gap-1 items-start justify-center w-40">
            <input
              type="checkbox"
              checked={persona.misionero || false}
              readOnly
              className="mt-3"
            />
            <label>Misionero que sirve en el campo</label>
          </div>
        </div>
        <div className="overflow-x-auto mt-2">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: ".9rem",
            }}
            className="sm:min-w-full min-w-[900px]"
          >
            <thead>
              <tr className="text-black border-r-2 border-l-2 border-t-2 border-b border-black font-bold text-sm leading-4 mt-0 pt-0">
                <th className="w-32 border-r border-black text-center align-middle mt-0 pt-0">
                  <p className="-mt-3">
                    Año de servicio <div>{selectedYear}</div>
                  </p>
                </th>
                <th className="w-24 border-r border-black text-center align-middle mt-0 pt-0">
                  <p className="-mt-3">Participación</p>
                  <p>en el</p>
                  <p>ministerio</p>
                </th>
                <th className="w-28 border-r border-black text-center align-middle mt-0 pt-0">
                  <p className="-mt-3">Cursos Bíblicos</p>
                </th>
                <th className="w-24 border-r border-black text-center align-middle mt-0 pt-0">
                  <p className="-mt-3">Precursor Auxiliar</p>
                </th>
                <th className="w-40 pb-2 border-r border-black text-center text-pretty align-middle mt-0 pt-0">
                  <p className="-mt-1"> Horas </p>
                  <p className="font-semibold text-pretty">
                    (Si es precursor o misionero que
                  </p>
                  <p className="font-semibold text-pretty">
                    sirve en el campo)
                  </p>
                </th>
                <th className="w-72 text-center align-middle mt-0 pt-0">
                  <p className="-mt-3">Notas</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                "septiembre",
                "octubre",
                "noviembre",
                "diciembre",
                "enero",
                "febrero",
                "marzo",
                "abril",
                "mayo",
                "junio",
                "julio",
                "agosto",
              ].map((mes) => (
                <tr
                  key={mes}
                  className="hover:bg-gray-100 text-center text-black"
                >
                  <td className="border-r border-b border-l-2 border-black whitespace-nowrap text-left pl-1 align-middle pb-2">
                    {mes.charAt(0).toUpperCase() + mes.slice(1)}
                  </td>
                  <td className="border-r border-b border-black whitespace-nowrap align-middle">
                    <input
                      type="checkbox"
                      checked={
                        persona.registros?.[selectedYear]?.[mes]
                          ?.participacion || false
                      }
                      readOnly
                    />
                  </td>
                  <td className="border-r border-b border-black whitespace-nowrap align-middle pb-2">
                    <span className="w-full block">
                      {persona.registros?.[selectedYear]?.[mes]?.cursos || ""}
                    </span>
                  </td>
                  <td className="border-r border-b border-black whitespace-nowrap align-middle">
                    <input
                      type="checkbox"
                      checked={
                        persona.registros?.[selectedYear]?.[mes]?.precursor ||
                        false
                      }
                      readOnly
                    />
                  </td>
                  <td className="border-r border-b border-black whitespace-nowrap align-middle pb-2">
                    <span className="w-full block">
                      {persona.registros?.[selectedYear]?.[mes]?.horas || ""}
                    </span>
                  </td>
                  <td className="border-r-2 border-b border-black whitespace-nowrap align-middle pb-2">
                    <span className="w-full block">
                      {persona.registros?.[selectedYear]?.[mes]?.notas || ""}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Fila adicional para Totales */}
              <tr className="font-bold text-center border-t border-black text-black">
                <td
                  colSpan="4"
                  className="border-r border-black text-right align-middle pb-2 pr-2" // Eliminar el borde
                >
                  Total
                </td>
                <td className="border-x border-b-2 border-black whitespace-nowrap align-middle pb-2">
                  <span className="w-full block">
                    {persona.totalHoras || ""} {/* Mostrar el total de horas */}
                  </span>
                </td>
                <td className="border-r-2 border-l border-b-2 border-black whitespace-nowrap align-middle pb-2">
                  <span className="w-full block">
                    {} {/* Mostrar el total de notas */}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default VistaPreviaTarjeta;
