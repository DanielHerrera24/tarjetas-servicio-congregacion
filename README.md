# GestSur - Gestión Simplificada de Congregaciones

Bienvenido a **GestSur**, una aplicación web diseñada para facilitar la gestión de datos relacionados con congregaciones. Este proyecto está enfocado en la eficiencia y simplicidad, brindando una experiencia intuitiva tanto para administradores como para usuarios finales.

---

## 🚀 Características principales

### 🔒 **Gestíon de Accesos con Custom Claims**
- Asigna permisos y roles personalizados a cada usuario registrado.
- Los roles determinan las acciones que el usuario puede realizar dentro de la aplicación.
- Configura manualmente la **congregación** con la que cada usuario puede interactuar.

### 🕵️‍♂️ **Autenticación Segura**
- Registro y autenticación mediante Firebase Authentication.
- Custom Claims asignados manualmente a cada usuario registrado para aumentar la seguridad, vinculando su **UID** con una congregación específica.

### ⚖️ **Roles de Usuario**
- **Administrador:** Tiene acceso completo al sistema, incluyendo gestión de usuarios y roles.
- **Gestor:** Puede gestionar todas las tarjetas, pero no tiene la opción de Accesos para dar acceso a nuevos usuarios ni asignar roles.
- **Editor:** Puede crear y modificar contenido, pero no puede añadir año de servicio, ni subir información, ni eliminar grupos, ni eliminar tarjetas permanentemente.
- **Espectador:** Tiene acceso solo para ver información, sin permisos para realizar cambios en toda la aplicación.

### 🔄 **Gestíon Dinámica de Congregaciones y Grupos**
- Organiza las tarjetas de servicio por grupos dentro de las congregaciones.
- Permite agregar, editar y eliminar grupos y tarjetas de manera sencilla.

### 📈 **Funcionalidades Avanzadas de las Tarjetas**
- **CRUD Completo:** Crear, leer, actualizar y eliminar tarjetas de servicio.
- **Asignación Flexible:** Mueve tarjetas entre grupos con facilidad.
- **Subir información masivamente** Utiliza una plantilla de Excel para subir información de tus tarjetas de forma masiva.
- **Descarga en PDF:** Exporta tarjetas en un formato compatible con cualquier dispositivo.

### 🌐 **Interfaz Moderna y Accesible**
- Diseño intuitivo, responsivo y adaptable a cualquier dispositivo.
- Temas claro y oscuro para una experiencia personalizada.

### ⌚ **Notificaciones y Alertas**
- Información clara y en tiempo real sobre cambios en la base de datos.
- Alertas amigables para confirmación de acciones importantes (como eliminaciones).

---

## 🛠️ Tecnologías utilizadas

- **Frontend:**
  - [React](https://reactjs.org/) con [Vite](https://vitejs.dev/) para un desarrollo rápido y modular.
  - [TailwindCSS](https://tailwindcss.com/) para un diseño limpio y moderno.

- **Backend:**
  - [Firebase Firestore](https://firebase.google.com/docs/firestore) para almacenamiento en la nube.
  - [Firebase Authentication](https://firebase.google.com/docs/auth) para la autenticación de usuarios.

- **Hosting:**
  - [Netlify](https://www.netlify.com/) para un despliegue rápido y confiable.

---

## 📧 Contacto

Si tienes preguntas o necesitas soporte, no dudes en contactar:

- **Autor:** Daniel Herrera
- **Email:** [info.daniherrera@gmail.com](mailto:info.daniherrera@gmail.com)
- **GitHub:** [https://github.com/DanielHerrera24](https://github.com/DanielHerrera24)

---

¡Gracias por usar GestSur! 😊
