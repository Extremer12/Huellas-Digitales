# Huellas Digitales 🐾

**Huellas Digitales** es una plataforma moderna y solidaria diseñada para conectar a animales rescatados con hogares responsables a nivel global. Con un enfoque inicial en Argentina y expandiéndose a toda Hispanoamérica, busca facilitar el proceso de adopción y búsqueda de mascotas perdidas mediante una interfaz intuitiva, profesional y de alto impacto visual.

## 🚀 Características Principales

- **Adopción Responsable**: Listado completo de animales con perfiles detallados y filtros avanzados.
- **Mascotas Perdidas**: Reportes geolocalizados en tiempo real para encontrar a tu mejor amigo.
- **Mapa Interactivo Global**: Visualiza mascotas perdidas, refugios y veterinarias cercanas con detección automática de ubicación.
- **Internacionalización (i18n)**: Soporte para múltiples regiones (Argentina, México, etc.) con términos localizados.
- **Landing Page de Alto Impacto**: Diseño profesional con animaciones fluidas y experiencia de usuario optimizada desde el primer ingreso.
- **Chat Integrado**: Mensajería directa segura entre adoptantes y protectores.
- **PWA (Progressive Web App)**: Disponible para instalar en móviles para una experiencia nativa.
- **Geolocalización Inteligente**: Auto-detección de país y provincia para una experiencia personalizada.

## 🛠️ Stack Tecnológico

- **Frontend**: React + Vite + Tailwind CSS
- **Componentes UI**: Shadcn/UI + Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Gestión de Estado**: TanStack Query (React Query)
- **Validación**: Zod

## 💻 Instalación Local

1. **Clonar el repositorio**:
   ```bash
   git clone [url-del-repo]
   cd Huellas-Digitales
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz con las siguientes claves:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## 📖 Contribuir

Si deseas contribuir al proyecto:
1. Haz un Fork del proyecto.
2. Crea una rama para tu característica (`git checkout -b feature/NuevaMejora`).
3. Haz commit de tus cambios (`git commit -m 'Añade nueva mejora'`).
4. Haz Push a la rama (`git push origin feature/NuevaMejora`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto es de código abierto y gratuito para la comunidad.

---
*Desarrollado con ❤️ para ayudar a quienes no tienen voz.*
