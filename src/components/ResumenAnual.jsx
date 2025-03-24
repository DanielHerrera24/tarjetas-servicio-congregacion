/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";

const ResumenAnual = () => {
  const [serviceYearData, setServiceYearData] = useState({
    2024: {
      precursoresRegulares: {},
      precursoresAuxiliares: {},
      publicadores: {},
    },
    2025: {
      precursoresRegulares: {},
      precursoresAuxiliares: {},
      publicadores: {},
    },
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const { congregacionId } = useParams();

  const meses = [
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
  ];

  const fetchResumenAnual = async () => {
    try {
      setLoading(true);

      const gruposCollection = collection(
        db,
        "congregaciones",
        congregacionId,
        "grupos"
      );

      const gruposSnapshot = await getDocs(gruposCollection);

      // Crear el resumen inicial
      const resumen = {
        2024: {
          precursoresRegulares: {},
          precursoresAuxiliares: {},
          publicadores: {},
        },
        2025: {
          precursoresRegulares: {},
          precursoresAuxiliares: {},
          publicadores: {},
        },
      };

      // Inicializar los meses en ambos años
      [2024, 2025].forEach((year) => {
        meses.forEach((mes) => {
          resumen[year].precursoresRegulares[mes] = {
            informes: 0,
            horas: 0,
            cursos: 0,
          };
          resumen[year].precursoresAuxiliares[mes] = {
            informes: 0,
            horas: 0,
            cursos: 0,
          };
          resumen[year].publicadores[mes] = {
            informes: 0,
            horas: 0,
            cursos: 0,
          };
        });
      });

      console.log("Resumen inicial:", resumen);

      // Recorrer los grupos
      for (const grupoDoc of gruposSnapshot.docs) {
        const hermanosCollection = collection(
          db,
          "congregaciones",
          congregacionId,
          "grupos",
          grupoDoc.id,
          "hermanos"
        );

        const hermanosSnapshot = await getDocs(hermanosCollection);

        // Recorrer los hermanos
        for (const hermanoDoc of hermanosSnapshot.docs) {
          const hermanoData = hermanoDoc.data();

          // Validar que haya registros
          if (!hermanoData.registros) {
            console.log("Sin registros para hermano:", hermanoDoc.id);
            continue;
          }

          // Iterar por los años relevantes
          Object.keys(hermanoData.registros).forEach((year) => {
            if (year !== "2024" && year !== "2025") return;
            const registrosAnuales = hermanoData.registros[year];

            meses.forEach((mes) => {
              const registroMes = registrosAnuales[mes];
              if (!registroMes) return;

              const { precursor, cursos = 0, horas = 0 } = registroMes;

              if (hermanoData.regular) {
                resumen[year].precursoresRegulares[mes].horas += horas;
                resumen[year].precursoresRegulares[mes].cursos += cursos;
                resumen[year].precursoresRegulares[mes].informes++;
              } else if (precursor) {
                resumen[year].precursoresAuxiliares[mes].horas += horas;
                resumen[year].precursoresAuxiliares[mes].cursos += cursos;
                resumen[year].precursoresAuxiliares[mes].informes++;
              } else {
                resumen[year].publicadores[mes].horas += horas;
                resumen[year].publicadores[mes].cursos += cursos;
                resumen[year].publicadores[mes].informes++;
              }
            });
          });
        }
      }

      console.log("Resumen final generado:", resumen);
      setServiceYearData(resumen);
    } catch (error) {
      console.error("Error al generar el resumen anual:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumenAnual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Asegúrate de que este efecto no se ejecute en bucle

  const renderTable = (data, title) => (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Mes</th>
            <th className="border border-gray-300 px-4 py-2">Informes</th>
            <th className="border border-gray-300 px-4 py-2">Horas</th>
            <th className="border border-gray-300 px-4 py-2">Cursos</th>
          </tr>
        </thead>
        <tbody>
          {meses.map((mes) => (
            <tr key={mes}>
              <td className="border border-gray-300 px-4 py-2">{mes}</td>
              <td className="border border-gray-300 px-4 py-2">
                {data[mes]?.informes || ""}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {data[mes]?.horas || ""}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {data[mes]?.cursos || ""}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-gray-300 px-4 py-2">Totales</td>
            <td className="border border-gray-300 px-4 py-2">
              {Object.values(data).reduce(
                (acc, mes) => acc + (mes.informes || 0),
                0
              )}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {Object.values(data).reduce(
                (acc, mes) => acc + (mes.horas || 0),
                0
              )}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {Object.values(data).reduce(
                (acc, mes) => acc + (mes.cursos || 0),
                0
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className={`hidden sm:block absolute top-0 left-0 shadow-lg border rounded-full p-3 ${
          darkMode
            ? "bg-gray-800 border-white text-red-500 hover:bg-gray-700"
            : "bg-white border-black text-red-500 hover:bg-gray-100"
        } hover:scale-110`}
      >
        <FaArrowLeft size={24} />
      </button>
      {["2024", "2025"].map((year) => (
        <div key={year}>
          <h1 className="text-2xl font-bold my-4">Resumen Año {year}</h1>
          {renderTable(
            serviceYearData[year].precursoresRegulares,
            "Precursores Regulares"
          )}
          {renderTable(
            serviceYearData[year].precursoresAuxiliares,
            "Precursores Auxiliares"
          )}
          {renderTable(serviceYearData[year].publicadores, "Publicadores")}
        </div>
      ))}
    </div>
  );
};

export default ResumenAnual;
