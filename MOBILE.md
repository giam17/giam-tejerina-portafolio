# Versión móvil

## Propuesta 2: collage editorial

`src/mobile-collage.css` añade una segunda dirección visual sobre la base responsive: recortes, cinta de especialidades, tarjetas inclinadas, fotografía tipo polaroid, galerías enmarcadas y enlaces de contacto en papel. Todas sus reglas se limitan a pantallas de hasta 900 px.

`src/MobileExperience.tsx` se monta exclusivamente en móvil. Añade navegación flotante, indicador de lectura, entradas de tarjetas con IntersectionObserver y pequeños desplazamientos de los adornos al hacer scroll. Los eventos de scroll se agrupan con requestAnimationFrame; no hay un bucle continuo para calcular posiciones. Al cambiar a escritorio se eliminan observadores, animaciones y estilos temporales.

La portada flota y la cinta de especialidades se desplaza. El botón de pausa controla estos movimientos adicionales; las animaciones originales de personajes se conservan. Los movimientos nuevos respetan también `prefers-reduced-motion` y `?motion=off`. El visor del museo oculta la navegación flotante mientras está abierto.

La comparación de escritorio antes/después de esta propuesta conserva las medidas y tipografías de los 124 elementos registrados (secciones, imágenes y textos).

La composición cambia hasta 900 px, incluyendo celulares en horizontal. Por encima de ese ancho se mantiene la composición original de escritorio. `src/mobile.css`, importado después de las hojas de cada sección, contiene las reglas de la adaptación.

## Composición

- Portada: título PORTA/FOLIO, personaje, sello y navegación con botones de 44 px.
- Sobre mí: presentación, fotografía, skills, herramientas, experiencia y educación en tarjetas verticales. Los stickers conservan sus superposiciones y expresiones.
- Mis proyectos: tarjetas numeradas con accesos directos a cada proyecto y los mismos personajes animados.
- Museo: teléfonos en dos columnas, capturas a ancho completo, paleta y tecnologías. Las capturas conservan su visor de ampliación.
- Personajes: dibujos agrupados en tarjetas de papel, trazos de fondo, controles junto a cada grupo y las ocho nubes transparentes animadas.
- EDUCA: relato visual vertical con logotipo, panorama, fotografías, construcción y variantes de la marca.
- Contacto: título animado, personaje y filas amplias con enlaces que permiten ajustar el texto.

## Movimiento y recursos

Se reutilizan las animaciones, expresiones y tiempos existentes. Tocar los stickers activa su salto; tocar GRACIAS reproduce la onda completa. Los botones de personajes permiten destacar una ilustración. Los efectos respetan `prefers-reduced-motion` y el parámetro de revisión `?motion=off`.

Las imágenes conservan el catálogo WebP existente. `responsiveImage` y la precarga de expresiones usan tamaños adaptados a móvil; escritorio conserva su cálculo anterior. No se requieren nuevos originales ni dependencias.

## Comprobaciones

- Anchos útiles de 320, 390 y 430 px, y horizontal de 844 px: sin desplazamiento horizontal ni texto desbordado.
- Revisión visual de las siete secciones y funcionamiento de navegación, visor, controles de personajes, salto de stickers y onda del título.
- Entradas animadas e imágenes de EDUCA y Personajes comprobadas al entrar en vista; nubes con animación activa.
- Comparación de escritorio a 1440 px: las siete secciones, 67 imágenes y 51 bloques de texto conservan sus posiciones y dimensiones. Las familias y tamaños tipográficos coinciden con la referencia anterior.
- Compilación de producción con TypeScript y Vite.

Las pruebas se realizaron en el navegador con dimensiones de celular; la revisión final en un dispositivo físico puede hacerse mediante el servidor local en la misma red Wi-Fi.
