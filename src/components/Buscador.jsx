/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase"; // Asegúrate de importar correctamente tu instancia de Firestore
import { FaSearch } from "react-icons/fa";

const Buscador = ({ selectedYear }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // Obtiene el año seleccionado
  const [isFocused, setIsFocused] = useState(false); // Estado para controlar el enfoque del input

  const handleSearch = async (term) => {
    if (term.length < 3) {
      setResults([]);
      console.log("Término demasiado corto para buscar.");
      return;
    }

    console.log("Iniciando búsqueda con el término:", term);

    setLoading(true);

    try {
      const gruposCollection = collection(db, "congregaciones");
      const congregacionesSnapshot = await getDocs(gruposCollection);

      console.log(
        "Cantidad de congregaciones encontradas:",
        congregacionesSnapshot.size
      );

      const coincidencias = [];

      for (const congregacionDoc of congregacionesSnapshot.docs) {
        console.log("Procesando congregación:", congregacionDoc.id);

        const gruposCollection = collection(congregacionDoc.ref, "grupos");
        const gruposSnapshot = await getDocs(gruposCollection);

        console.log(
          `Congregación ${congregacionDoc.id} tiene ${gruposSnapshot.size} grupos.`
        );

        for (const grupoDoc of gruposSnapshot.docs) {
          console.log("Procesando grupo:", grupoDoc.id);

          const grupoData = grupoDoc.data(); // Obtener los datos del grupo, incluido el nombre
          const hermanosCollection = collection(grupoDoc.ref, "hermanos");
          const hermanosSnapshot = await getDocs(hermanosCollection);

          hermanosSnapshot.forEach((doc) => {
            const hermanoData = doc.data();
            if (hermanoData.nombre.toLowerCase().includes(term)) {
              coincidencias.push({
                id: doc.id,
                nombre: hermanoData.nombre,
                grupoId: grupoDoc.id,
                grupoNombre: grupoData.nombre, // Añadir el nombre del grupo
                congregacionId: congregacionDoc.id,
              });
            }
          });
        }
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
        <div className="resultados-modal absolute bg-white text-black rounded-b-2xl border shadow-lg w-full max-h-60 md:max-h-80 overflow-y-auto z-50">
          <p className="text-center py-1 px-1">Introduce 3 caracteres</p>
        </div>
      )}

      {/* Mostrar resultados agrupados */}
      {searchTerm.length >= 3 && (
        <div className="resultados-modal absolute bg-white text-black rounded-b-2xl border shadow-lg mt-2 w-full max-h-60 md:max-h-80 overflow-y-auto z-50">
          {loading ? (
            <p className="text-center p-2">Cargando...</p>
          ) : Object.keys(gruposAgrupados).length > 0 ? (
            Object.keys(gruposAgrupados).map((grupo) => (
              <div key={grupo} className="p-1">
                <p className="font-bold px-4 bg-blue-500 text-white rounded-r-xl absolute">{grupo}</p>
                {gruposAgrupados[grupo].map((result, index) => (
                  <Link
                    key={result.id}
                    to={`/${result.congregacionId}/grupos/${result.grupoId}`}
                    className={`block py-2 hover:bg-gray-200 border-b-2 ${index === 0 ? 'mt-8' : ''}`}
                    state={{selectedYear}}
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
