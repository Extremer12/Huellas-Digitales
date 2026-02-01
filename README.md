# Huellas Digitales 🐾

**Huellas Digitales** es una plataforma moderna y solidaria diseñada para conectar a animales rescatados con hogares responsables. Enfocada inicialmente en el mercado de Argentina, busca facilitar el proceso de adopción y búsqueda de mascotas perdidas mediante una interfaz intuitiva, rápida y profesional.

## 🚀 Características Principales

- **Adopción Responsable**: Listado completo de animales con filtros por tipo, tamaño y ubicación.
- **Mascotas Perdidas**: Sección dedicada para reportar y buscar animales extraviados en tiempo real.
- **Chat Integrado**: Sistema de mensajería directa entre adoptantes y protectores.
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles para una experiencia nativa.
- **Autenticación con Google**: Acceso rápido y seguro para los usuarios.
- **Diseño Inmersivo**: Interfaz optimizada para móviles con animaciones fluidas y modo oscuro.

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
