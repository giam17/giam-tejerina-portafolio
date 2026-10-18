# Recursos del portafolio

## Organización

| Carpeta | Contenido |
| --- | --- |
| `src/assets/animations` | Expresiones de portada, Sobre mí y Mis proyectos |
| `src/assets/sobre-mi` | Fotografía e iconos de herramientas |
| `src/assets/museo` | Capturas, teléfonos, paleta e iconos del museo |
| `src/assets/personajes` | Personajes, nube y trazos |
| `src/assets/educa` | Logotipos, fotos y construcción de marca |
| `src/assets/contacto` | Personaje, separador e iconos de contacto |
| `src/assets/shared` | Separadores reutilizados entre secciones |
| `design-source/originals` | PNG originales, con nombres relacionados con los de la web |
| `D:/Proyectos/FotosUsadasPort/references` | Exportaciones completas de las siete secciones para comparación, fuera del repositorio |
| `D:/Proyectos/FotosUsadasPort/unused` | Exportaciones sin uso, conservadas fuera del repositorio |

No guardar nuevos originales en `dist`: es una carpeta generada y se reemplaza al compilar. Los originales usados permanecen en `design-source/originals`, según lo solicitado. Se trasladaron 16 archivos (138.3 MB) de referencias y exportaciones sin uso al archivo externo, con comprobación SHA-256. Las referencias externas son opcionales para `assets:check` y no se requieren en Vercel.

## Optimización

Las 42 imágenes utilizadas sumaban 116.916 MB en PNG. Sus versiones habituales suman 18.798 MB, una reducción del 83.92%. La descarga real depende de la pantalla, su densidad y las secciones visitadas. El conjunto completo de variantes ocupa más que el conjunto habitual porque incluye copias a la resolución original para pantallas grandes y ampliaciones.

Se usa WebP con compresión sin pérdida, manteniendo el color y la transparencia. Las copias de resolución completa se verifican frente al original: cada píxel visible y todo el canal alfa deben coincidir. Las variantes más pequeñas se redimensionan proporcionalmente con Lanczos3, sin recortar ni cambiar sombras, márgenes, giros o espejados. Los SVG conservan sus bytes originales y sus dimensiones.

`src/assets/catalog.generated.ts` relaciona cada imagen con sus variantes. `src/assets/images.ts` prepara `srcset`, `sizes`, carga diferida y precarga de animaciones. La portada se carga con prioridad; las otras imágenes se cargan cerca de su posición. Las imágenes ocultas por una entrada animada empiezan a descargarse explícitamente al entrar en vista para evitar bloquear la animación. El visor del museo utiliza un tamaño acorde al espacio ampliado.

## Mantener o agregar recursos

1. Guardar el PNG de origen en la carpeta correspondiente de `design-source/originals`.
2. Agregar o actualizar su entrada en `scripts/assets.json`, con su nombre y ancho visual en la composición de 1440 px.
3. Ejecutar `npm run assets:optimize` y `npm run assets:check`.
4. Importar la variante principal de `src/assets` y aplicar `responsiveImage(src)` al elemento `img`.
5. Ejecutar `npm run build` y revisar la sección.

Las variantes generadas forman parte del proyecto: Vercel solo necesita `npm run build`. La versión móvil utiliza `mobileSizes` en `responsiveImage` para declarar el espacio visual de cada imagen hasta 900 px. Las animaciones precargan sus expresiones con el mismo tamaño que sus imágenes visibles, sin reorganizar ni volver a exportar los recursos. El cálculo de escritorio permanece igual.

## Verificación realizada

- Compilación de producción y comprobación de rutas, mayúsculas y dimensiones.
- Las 42 conversiones a resolución completa pasaron la comparación de píxeles y alfa.
- Las 67 imágenes de la página cargaron al recorrerla. Su geometría normalizada coincide con la anterior a la optimización.
- La primera vista de escritorio cargó 31 imágenes, frente a las 67 que cargaban antes.
- En el navegador de prueba, móvil seleccionó caras de portada de 260 px; escritorio, de 1040 px.
- El visor del museo conserva imágenes nítidas y utiliza sus variantes para la ampliación.

Informes: `reports/assets.json`. Capturas y comprobaciones de esta sesión: `D:/Codex/2026-10-05/pu/asset-optimization-review`.

Referencia del codificador: [Sharp: opciones de WebP](https://sharp.pixelplumbing.com/api-output/#webp).
