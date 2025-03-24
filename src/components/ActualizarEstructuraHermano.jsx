import { useState } from "react";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserCheck } from "react-icons/fa";

const ActualizarInfoHermanos = () => {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const actualizarHermanos = async () => {
    setLoading(true);
    setMensaje("");
    const congregacionId = "primavera"; // ID de la congregación

    try {
      const gruposRef = collection(db, "congregaciones", congregacionId, "grupos");
      const gruposSnap = await getDocs(gruposRef);
      
      const batch = writeBatch(db);
      let contador = 0;

      for (const grupoDoc of gruposSnap.docs) {
        const grupoId = grupoDoc.id;
        const hermanosRef = collection(db, "congregaciones", congregacionId, "grupos", grupoId, "hermanos");
        const hermanosSnap = await getDocs(hermanosRef);

        hermanosSnap.forEach((hermanoDoc) => {
          const data = hermanoDoc.data();
          const hermanoRef = hermanoDoc.ref;

          const nuevaEstructura = {
            nombre: data.nombre || "",
            fechaBautismo: data.fechaBautismo || "",
            fechaNacimiento: data.fechaNacimiento || "",
            totalHorasPorAño: data.totalHorasPorAño || {},
            registros: { ...data.registros } // Mover todo lo demás dentro de registros
          };

          Object.keys(data).forEach((key) => {
            if (!["nombre", "fechaBautismo", "fechaNacimiento", "totalHorasPorAño", "registros"].includes(key)) {
              const año = new Date().getFullYear().toString();
              nuevaEstructura.registros[año] = nuevaEstructura.registros[año] || {};
              nuevaEstructura.registros[año][key] = data[key];
            }
          });

          batch.update(hermanoRef, nuevaEstructura);
          contador++;
        });
      }

      await batch.commit();
      setMensaje(`Se actualizaron ${contador} hermanos correctamente.`);
    } catch (error) {
      console.error("Error actualizando hermanos:", error);
      setMensaje("Error al actualizar la información.");
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={actualizarHermanos} disabled={loading} className="flex justify-center items-center bg-blue-500 text-white py-2 px-4 rounded gap-2">
        <span><FaUserCheck /></span>
        {loading ? "Actualizando..." : "Actualizar Información"}
      </button>
      {mensaje && <p className="mt-2 text-sm text-gray-700">{mensaje}</p>}
    </div>
  );
};

export default ActualizarInfoHermanos;
