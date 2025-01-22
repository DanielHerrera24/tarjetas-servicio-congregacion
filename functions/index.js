const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors"); // Importar la librería CORS

// Inicializar Firebase Admin SDK
admin.initializeApp();

// Habilitar CORS para la función
const corsHandler = cors({origin: true});

// Función para asignar un custom claim a un usuario
exports.assignCustomClaim = onRequest(async (req, res) => {
  // Utiliza CORS en la solicitud
  corsHandler(req, res, async () => {
    // Verifica que la solicitud sea un POST
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Asegúrate de que la solicitud tenga un token de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).send("Authorization token missing");
    }

    // Obtén el token y verifica el token de Firebase
    const token = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) {
        return res.status(403).send("Unauthorized");
      }

      // Obtener los datos enviados en la solicitud (uid y congregacionId)
      const {uid, congregacionId} = req.body;

      // Asignar el custom claim de congregacionId al usuario
      await admin.auth().setCustomUserClaims(uid, {congregacionId});

      return res.status(200).send("Custom claim assigned successfully");
    } catch (error) {
      console.error("Error al asignar el custom claim:", error);
      return res.status(500).send("Error al asignar el custom claim");
    }
  });
});
