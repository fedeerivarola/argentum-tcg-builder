# Argentum TCG

Argentum TCG es una plataforma web para crear, revisar y votar cartas coleccionables estilo Magic: The Gathering. Los usuarios registrados pueden diseñar cartas con imágenes personalizadas (recorte con zoom y posición), definirlas con tipo, subtipo, estadísticas (ataque/vida), costo de maná y descripción. Las cartas creadas quedan pendientes de revisión; un administrador las approve o rechaza. Las cartas aprobadas aparecen en la Galería pública donde cualquier usuario puede ver su detalle y votar (1-5 estrellas). La Galería soporta vista en grilla o lista para facilitar la navegación y comparación.

- 🔐 Autenticación con Firebase
- 🎨 Creador de cartas con editor de imágenes
- ⭐ Sistema de votaciones
- 📋 Panel de administración
- 📱 Diseño responsivo

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Una cuenta de Firebase con:
  - Authentication (Email/Password)
  - Firestore Database
  - Storage (opcional)

## Configuración

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd argentum-tcg-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication > Email/Password
   - Crear una base de datos Firestore en modo test
   - Copiar las credenciales

4. **Crear archivo de configuración**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Firebase:
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Opcional
VITE_API_URL=http://localhost:3001
VITE_ADMIN_EMAIL=admin@tudominio.com
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Iniciar servidor de imágenes (opcional, en otra terminal)**
```bash
node server.cjs
```

## Scripts

- `npm run dev` - Iniciar app en desarrollo
- `npm run build` - Construir para producción
- `npm run lint` - Verificar código
- `npm run preview` - Previsualizar build

## Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
├── context/        # Contextos de React (Auth)
├── lib/            # Configuración Firebase y servicios
├── pages/          # Páginas de la aplicación
├── types/          # Definiciones TypeScript
└── docs/           # Documentación
```

## Licencia

MIT

---

Hecho con ❤️ por [Federico A. Rivarola](mailto:federicorivarola@outlook.com)
