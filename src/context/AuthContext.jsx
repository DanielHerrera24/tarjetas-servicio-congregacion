/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Importar funciones para Firestore
import { auth, db } from "../firebase"; // Asegúrate de que `db` está correctamente inicializado

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("No has iniciado sesión");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Para almacenar el rol del usuario

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email); // Nueva función para restablecer contraseña

  const logout = () => {
    setRole(null); // Restablecer el rol al cerrar sesión
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Obtener el rol del usuario desde Firestore
          const userDoc = doc(db, "usuarios", currentUser.uid);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            setRole(userSnapshot.data().role || "viewer"); // Asigna "viewer" si no tiene rol
          } else {
            console.warn("El usuario no tiene un documento en Firestore");
            setRole("viewer");
          }
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error.message);
          setRole("viewer");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <authContext.Provider value={{ signup, login, resetPassword, user, role, logout, loading }}>
      {children}
    </authContext.Provider>
  );
}
