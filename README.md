# Giam Tejerina · Portafolio

React, TypeScript, Vite y Motion. Portafolio basado en Figma con Portada, Sobre mí, Mis proyectos, Museo, Personajes, EDUCA y Contacto.

Requiere Node.js 22.14 o superior.

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

`npm run typecheck` comprueba los tipos. La compilación de producción se guarda en `dist/`.

## Vercel

Importar el proyecto con la configuración **Vite**, comando de compilación `npm run build` y directorio de salida `dist`. No se requieren variables de entorno. El repositorio está preparado para desplegarse; no se ha realizado ningún despliegue.

## Imágenes y organización

`src/assets/` contiene únicamente los recursos de la web, con nombres descriptivos y carpetas por sección. Los separadores compartidos están en `src/assets/shared/` y las expresiones animadas en `src/assets/animations/`.

`design-source/originals/` conserva los 42 PNG usados para regenerar los recursos optimizados. Las capturas completas de Figma y las exportaciones sin uso están fuera del proyecto, en `D:/Proyectos/FotosUsadasPort/references/` y `D:/Proyectos/FotosUsadasPort/unused/`. No se necesitan esas carpetas externas para compilar ni publicar la web.

Para regenerar las imágenes después de cambiar un original:

```bash
npm run assets:optimize
npm run build
```

El proceso genera WebP sin pérdida, variantes para diferentes densidades de pantalla y un catálogo de rutas. Comprueba los píxeles visibles y el canal alfa de las copias a resolución completa. El navegador selecciona el tamaño adecuado mediante `srcset`; las imágenes fuera de la primera vista se cargan al acercarse a ellas. La composición de escritorio conserva el diseño original.

La configuración está en `scripts/assets.json`; el informe de pesos y variantes, en `reports/assets.json`. No es necesario regenerarlas para cada compilación ni instalar herramientas de imágenes en Vercel.

## Versión móvil

Hasta 900 px, las siete secciones se reorganizan en una composición vertical con texto legible, tarjetas, galerías y controles táctiles. Conservan los colores, tipografías, ilustraciones, separadores y animaciones de escritorio. La adaptación vive en `src/mobile.css`; los estilos originales de cada sección permanecen intactos. Detalles y comprobaciones en [MOBILE.md](MOBILE.md).
