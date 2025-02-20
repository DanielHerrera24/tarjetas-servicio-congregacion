/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase"; // Asegúrate de importar correctamente tu instancia de Firestore
import { FaSearch } from "react-icons/fa";
import { useDarkMode } from "../context/DarkModeContext";

const Buscador = ({ selectedYear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // Obtiene el año seleccionado
  const [isFocused, setIsFocused] = useState(false); // Estado para controlar el enfoque del input
  const { darkMode } = useDarkMode();
  const { congregacionId } = useParams();

  const normalizeText = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const handleSearch = async (term) => {
    if (!congregacionId) {
      console.error("Error: congregacionId no está definido.");
      console.log(congregacionId);
      return;
    }

    if (term.length < 3) {
      setResults([]);
      console.log("Término demasiado corto para buscar.");
      return;
    }

    console.log("Iniciando búsqueda con el término:", term);

    setLoading(true);

    try {
      // Filtrar por congregación específica
  const gruposCollection = collection(db, `congregaciones/${congregacionId}/grupos`);
  const gruposSnapshot = await getDocs(gruposCollection);

      const coincidencias = [];
      const normalizedTerm = normalizeText(term); // Normaliza el término de búsqueda

      for (const grupoDoc of gruposSnapshot.docs) {
        const grupoData = grupoDoc.data(); // Obtener datos del grupo
        const hermanosCollection = collection(grupoDoc.ref, "hermanos");
        const hermanosSnapshot = await getDocs(hermanosCollection);

        hermanosSnapshot.forEach((doc) => {
          const hermanoData = doc.data();

          // Verifica que el nombre exista y sea una cadena antes de continuar
          if (hermanoData.nombre && typeof hermanoData.nombre === "string") {
            const normalizedNombre = normalizeText(hermanoData.nombre);

            if (normalizedNombre.includes(normalizedTerm)) {
              coincidencias.push({
                id: doc.id,
                nombre: hermanoData.nombre,
                grupoId: grupoDoc.id,
                grupoNombre: grupoData.nombre, // Añadir el nombre del grupo
                congregacionId,
              });
            }
          } else {
            console.warn(
              "Nombre inválido en los datos del hermano:",
              hermanoData
            );
          }
        });
      }

      if (coincidencias.length === 0) {
        console.log("No se encontraron coincidencias para el término:", term);
      } else {
        console.log("Resultados encontrados:", coincidencias);
      }

      setResults(coincidencias);
    } catch (error) {
      console.error("Error al buscar personas:", error);
    }

    setLoading(false);
  };

  // Función para agrupar resultados por nombre de grupo
  const agruparPorGrupo = (resultados) => {
    return resultados.reduce((grupoAcumulado, resultado) => {
      const grupo = resultado.grupoNombre;
      if (!grupoAcumulado[grupo]) {
        grupoAcumulado[grupo] = [];
      }
      grupoAcumulado[grupo].push(resultado);
      return grupoAcumulado;
    }, {});
  };

  const gruposAgrupados = agruparPorGrupo(results);

  return (
    <div className="buscador-container relative w-72">
      <FaSearch className="absolute left-3 top-2/4 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar tarjeta..."
        className="input-buscador border border-blue-500 pl-9 p-2 rounded w-full text-black"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          handleSearch(e.target.value.trim().toLowerCase());
        }}
        onFocus={() => setIsFocused(true)} // Cuando el input esté enfocado
        onBlur={() => setIsFocused(false)} // Cuando el input pierda el enfoque
      />

      {/* Mostrar mensaje solo cuando el input esté enfocado y el término sea menor a 3 */}
      {isFocused && searchTerm.length < 3 && (
        <div
          className={`resultados-modal absolute rounded-b-2xl border shadow-sm w-full max-h-60 md:max-h-80 overflow-y-auto z-50  ${
            darkMode
              ? "bg-[#303030] text-white shadow-gray-600"
              : "bg-[#f3f3f3] text-black"
          }`}
        >
          <p className="text-center py-1 px-1">Introduce 3 caracteres</p>
        </div>
      )}

      {/* Mostrar resultados agrupados */}
      {searchTerm.length >= 3 && (
        <div
          className={`resultados-modal absolute rounded-b-2xl border shadow-lg mt-0 w-full max-h-60 md:max-h-80 overflow-y-auto z-50  ${
            darkMode
              ? "bg-[#303030] text-white shadow-gray-600"
              : "bg-[#f3f3f3] text-black"
          }`}
        >
          {loading ? (
            <p className="text-center p-2">Cargando tarjetas...</p>
          ) : Object.keys(gruposAgrupados).length > 0 ? (
            Object.keys(gruposAgrupados).map((grupo) => (
              <div key={grupo} className="p-1">
                <p className="font-bold px-4 bg-blue-500 text-white rounded-r-xl absolute">
                  {grupo}
                </p>
                {gruposAgrupados[grupo].map((result, index) => (
                  <Link
                    key={result.id}
                    to={`/${result.congregacionId}/grupos/${result.grupoId}`}
                    className={`block py-2 border-b-2  ${
                      darkMode ? "hover:bg-gray-600" : "hover:bg-gray-300"
                    } ${index === 0 ? "mt-7" : ""}`}
                    state={{ selectedYear, searchTerm }}
                  >
                    {result.nombre}
                  </Link>
                ))}
              </div>
            ))
          ) : (
            <p className="text-center p-2">No se encontraron coincidencias.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Buscador;
