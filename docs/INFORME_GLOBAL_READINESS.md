# 🌍 Informe de Preparación Global (Global Readiness)

**Fecha:** 4 de Febrero, 2026
**Objetivo:** Evaluar la capacidad de la plataforma "Huellas Digitales" para operar en cualquier provincia o país de habla hispana.

## 1. Estado Actual

### ✅ Puntos a Favor
*   **Idioma:** Toda la interfaz está en español, lista para Latam/España.
*   **Mapa Dinámico:** El componente `InteractiveMap` utiliza coordenadas (lat/lng), lo que es agnóstico a la región política. Funciona en cualquier lugar del mundo.
*   **Registro de Usuarios:** `RegionSelector` permite guardar País y Provincia en el perfil del usuario utilizando campos de texto libre (parcialmente, ver limitaciones).

### ⚠️ Limitaciones Detectadas (Hardcoding)
Durante el análisis del código fuente, se detectaron los siguientes puntos que limitan la expansión inmediata:

1.  **Selector de Región (`RegionSelector.tsx`):**
    *   La constante `COUNTRIES` solo contiene **Argentina** y sus provincias.
    *   *Impacto:* Usuarios de otros países no pueden seleccionar su ubicación correctamente en el onboarding.

2.  **Mapa Interactivo (`InteractiveMap.tsx`):**
    *   El centro inicial del mapa está fijo en **San Juan, Argentina** (`[-31.5375, -68.5364]`).
    *   *Impacto:* Un usuario en México verá el mapa de San Juan al abrir la app hasta que mueva la vista o se obtenga su geolocalización (si la permite).

3.  **Publicación Inteligente (`SmartPublicationWizard.tsx`):**
    *   El mapa de "ubicación del encuentro" por defecto centra en **Buenos Aires** (`[-34.6037, -58.3816]`).
    *   El campo `location` tiene un valor por defecto `"Buenos Aires"`.

4.  **Base de Datos (Supabase):**
    *   Las tablas usan `location` (string) y `province` (string). Esto es flexible pero propenso a errores de tipeo ("Cordoba" vs "Córdoba").

## 2. Plan de Acción: Internacionalización 🌐

Para convertir "Huellas Digitales" en una plataforma verdaderamente global, se recomiendan los siguientes pasos técnicos:

### Fase 1: Desacople de Argentina (Prioridad Alta)
1.  **API de Países:** Reemplazar la constante `COUNTRIES` hardcodeada por una librería como `countries-cities` o una API gratuita (ej. `restcountries.com`) para listar todos los países hispanohablantes dinámicamente.
2.  **Geolocalización Inteligente:**
    *   Al iniciar, detectar la ubicación aproximada del usuario (IP o GPS del navegador).
    *   Centrar `InteractiveMap` y `SmartPublicationWizard` en esa ubicación detectada automáticamente.

### Fase 2: Flexibilidad de Datos
1.  **Formatos de Dirección:** Eliminar valores por defecto como "Buenos Aires" en los formularios.
2.  **Búsqueda Global:** Integrar un servicio de autocompletado de direcciones (ej. Google Places API o Nominatim OpenStreetMap) para estandarizar las ubicaciones ingresadas por los usuarios.

### Fase 3: Contenido Localizado
1.  **i18n (Internacionalización):** Aunque el idioma es compartido, los términos varían (ej. "Vereda" vs "Banqueta"). Implementar `i18next` para manejar variaciones regionales básicas si es necesario.

## 3. Conclusión
La arquitectura base (React + Mapa) es **compatible con la expansión global**. El principal obstáculo son las constantes "hardcodeadas" en los selectores y coordenadas iniciales. Con una refactorización menor (estimada en 3-5 días de desarrollo), la plataforma puede abrirse a cualquier país.
