import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Asegúrate de importar tu instancia de Firestore
import { collection, getDocs } from "firebase/firestore"; // Importa el componente de vista previa si ya existe
import { motion } from "framer-motion"; // Importa Framer Motion
import { FaArrowLeft, FaFileDownload } from "react-icons/fa";
import html2pdf from "html2pdf.js";

const NombramientosHermanos = () => {
  const { congregacionId } = useParams(); // Recoge el ID del nombramiento desde la URL
  const [hermanos, setHermanos] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedYear } = location.state || {};
  const nombramientoId = location.state?.nombramientoId;

  useEffect(() => {
    // Ahora puedes usar el nombramientoId aquí
    const obtenerHermanosPorNombramiento = async () => {
      try {
        const gruposCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos"
        );
        const gruposSnapshot = await getDocs(gruposCollection);

        let hermanosFiltrados = [];

        // Iterar sobre cada grupo para acceder a los hermanos
        for (const grupoDoc of gruposSnapshot.docs) {
          const hermanosCollection = collection(
            db,
            "congregaciones",
            congregacionId,
            "grupos",
            grupoDoc.id,
            "hermanos"
          );

          const hermanosSnapshot = await getDocs(hermanosCollection); // Obtener los documentos de los hermanos

          // Filtrar los hermanos según el nombramiento
          hermanosSnapshot.docs.forEach((hermanoDoc) => {
            const hermanoData = hermanoDoc.data();

            // Comprobar si el hermano tiene el nombramiento correspondiente
            if (
              (nombramientoId === "anciano" && hermanoData.anciano) ||
              (nombramientoId === "ministerial" && hermanoData.ministerial) ||
              (nombramientoId === "regular" && hermanoData.regular)
            ) {
              // Acceder directamente a las horas para el año seleccionado (si existe)
              const totalHoras =
                hermanoData.totalHorasPorAño[selectedYear] || 0; // Usar 0 si no hay datos para el año

              // Agregar los datos del hermano con el total de horas correspondiente
              hermanosFiltrados.push({
                id: hermanoDoc.id,
                ...hermanoData,
                totalHoras, // Agregar totalHoras al objeto
              });
            }
          });
        }

        setHermanos(hermanosFiltrados); // Almacenar los hermanos filtrados
      } catch (error) {
        console.error(
          "Error al obtener los hermanos:",
          error.message,
          error.code
        );
      }
    };

    if (nombramientoId) {
      obtenerHermanosPorNombramiento(); // Solo se llama si el nombramientoId está definido
    }
  }, [congregacionId, nombramientoId, selectedYear]);

  const generatePDF = () => {
    if (!selectedYear) {
      console.error("Error: El año no está definido.");
    } else {
      const element = document.getElementById("content-to-print");
      const opt = {
        margin: [0.2, 0.1, 0.2, 0.1],
        filename: `Tarjetas ${nombramientoId} ${selectedYear}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }, // Formato A4
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <>
      <motion.button
        onClick={() => navigate(-1)}
        className="hidden sm:block absolute top-2 left-2 bg-white shadow-lg border border-black rounded-full p-3 text-red-500 hover:bg-gray-100 hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowLeft size={24} /> {/* Flecha hacia atrás */}
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white sticky top-0 sm:mt-0 -mt-16 sm:top-12 px-3 py-2 shadow-xl rounded-xl z-20"
      >
        <motion.button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded shadow-lg transform transition-transform duration-200 hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Descargar en PDF
          <FaFileDownload />
        </motion.button>
      </motion.div>
      <motion.div
        id="content-to-print"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full max-w-[1024px] my-0 px-1 text-black"
      >
        {hermanos.map((hermano) => (
          <motion.li
            key={hermano.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="persona rounded-md bg-white text-sm flex flex-col mt-8"
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
                  {hermano.nombre}
                </p>
                <p className="text-sm text-black">
                  <span className="text-black font-bold">
                    Fecha de Nacimiento:
                  </span>{" "}
                  {hermano.fechaNacimiento}
                </p>
                <p className="text-sm text-black">
                  <span className="text-black font-bold">
                    Fecha de Bautismo:
                  </span>{" "}
                  {hermano.fechaBautismo}
                </p>
              </div>
              <div className="font-bold flex flex-col items-start mr-14">
                <div className="flex flex-wrap gap-1">
                  <input
                    type="checkbox"
                    checked={hermano.genero?.hombre || false}
                    readOnly
                    className="mt-3"
                  />
                  <label className="mr-14">Hombre</label>
                  <input
                    type="checkbox"
                    checked={hermano.genero?.mujer || false}
                    readOnly
                    className="mt-3"
                  />
                  <label>Mujer</label>
                </div>
                <div className="flex flex-wrap gap-1">
                  <input
                    type="checkbox"
                    checked={hermano.genero?.otrasOvejas || false}
                    readOnly
                    className="mt-3"
                  />
                  <label className="mr-7">Otras Ovejas</label>
                  <input
                    type="checkbox"
                    checked={hermano.genero?.ungido || false}
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
                  checked={hermano.anciano || false}
                  readOnly
                  className="mt-3"
                />
                <label>Anciano</label>
              </div>
              <div className="flex gap-1 items-start">
                <input
                  type="checkbox"
                  checked={hermano.ministerial || false}
                  readOnly
                  className="mt-3"
                />
                <label>Siervo Ministerial</label>
              </div>
              <div className="flex gap-1 items-start">
                <input
                  type="checkbox"
                  checked={hermano.regular || false}
                  readOnly
                  className="mt-3"
                />
                <label>Precursor Regular</label>
              </div>
              <div className="flex gap-1 items-start">
                <input
                  type="checkbox"
                  checked={hermano.especial || false}
                  readOnly
                  className="mt-3"
                />
                <label>Precursor Especial</label>
              </div>
              <div className="flex gap-1 items-start justify-center w-40">
                <input
                  type="checkbox"
                  checked={hermano.misionero || false}
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
                      <p className="-mt-3 flex flex-col">
                        Año de servicio <span>{selectedYear}</span>
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
                            hermano.registros?.[selectedYear]?.[mes]
                              ?.participacion || false
                          }
                          readOnly
                        />
                      </td>
                      <td className="border-r border-b border-black whitespace-nowrap align-middle pb-2">
                        <span className="w-full block">
                          {hermano.registros?.[selectedYear]?.[mes]?.cursos ||
                            ""}
                        </span>
                      </td>
                      <td className="border-r border-b border-black whitespace-nowrap align-middle">
                        <input
                          type="checkbox"
                          checked={
                            hermano.registros?.[selectedYear]?.[mes]
                              ?.precursor || false
                          }
                          readOnly
                        />
                      </td>
                      <td className="border-r border-b border-black whitespace-nowrap align-middle pb-2">
                        <span className="w-full block">
                          {hermano.registros?.[selectedYear]?.[mes]?.horas ||
                            ""}
                        </span>
                      </td>
                      <td className="border-r-2 border-b border-black whitespace-nowrap align-middle pb-2">
                        <span className="w-full block">
                          {hermano.registros?.[selectedYear]?.[mes]?.notas ||
                            ""}
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
                        {hermano.totalHoras || ""}{" "}
                        {/* Mostrar el total de horas */}
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
          </motion.li>
        ))}
      </motion.div>
    </>
  );
};

export default NombramientosHermanos;
