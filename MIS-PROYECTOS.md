# 03 / Mis proyectos

Sección Figma `1:165`, inspeccionada desde la sesión del navegador del usuario. Composición de 1440 × 720 px, situada en Y=2207 después de Sobre mí. Se escala proporcionalmente sin reorganizar sus elementos.

- Fondo #2035ED. Cuadrícula de 48 px, trazo #202324 de 1 px y opacidad 17%.
- Contenido `1:170`: (72,110), 900 × 581. Título relativo (43,−91), ancho 900, Unbounded Bold 94, interlineado 118%, #F4EBDD.
- Categorías: Changa One Regular 36/34; números Denk One Regular 96/34, centrados en cajas 175 × 175. Círculos 141 × 141, #292929, desplazados 17 px dentro de cada caja. Se conservan los solapamientos de texto y círculos.
- Grupos relativos al contenido: web (34,139), personajes (360,139), branding (209,359). Rótulos relativos a sus grupos: (113,110), (113,110), (105,110).
- Separador: reutiliza `src/assets/shared/divider-wave-blue.svg` (1440 × 41), color #86ACF5 y trazo 3. Contenedor de Figma (−4,−46), 1444 × 64; el SVG se coloca en (4,23) dentro del contenedor.
- Cara seria: (543,−210), 349 × 349, encima del separador y de la sección anterior. Fotogramas 6.1 y 6.2.
- Personaje de pie: (789,40), 630 × 630, con ajuste contain como Figma. Fotogramas 7.1 y 7.3. Sus imágenes originales tienen proporciones distintas y mantienen su proporción dentro de la caja.

Las dos animaciones reutilizan el componente Sticker existente y precargan los recursos. La cara seria mantiene los ojos abiertos 2000 ms y los cierra 300 ms. El personaje de pie alterna cada 1000 ms. Respetan movimiento reducido y `?motion=off`.

Efectos aprobados: al pasar el cursor sobre una categoría, el círculo crece 7%, el número gira −6° y el rótulo se desplaza 8 px a la derecha. La cara seria salta una sola vez por entrada del cursor. El personaje de pie sigue suavemente el cursor dentro de su caja, hasta ±3.5° de inclinación y un desplazamiento de ±4/3 px, y vuelve al centro al salir. Las áreas de interacción permanecen fijas. Los efectos de cursor solo funcionan con mouse y hover. El título y las tres categorías aparecen al llegar con el scroll, en una secuencia de 880 ms que termina en las posiciones originales y se ejecuta una sola vez. Todos estos efectos respetan movimiento reducido y `?motion=off`.

Verificación: TypeScript y compilación de producción correctos. Los cinco recursos de imagen son archivos locales no vacíos y cargan en el navegador. Comprobadas geometría, fuentes, capas y ajuste contain en escritorio; a 390 px se conserva la composición y no hay desplazamiento horizontal. El enlace PROYECTOS de la portada lleva a esta sección. Comparación visual con la referencia en el primer fotograma de ambos personajes.

Efectos verificados en el navegador: respuestas de categorías, salto de la cara seria, seguimiento del personaje y retorno al centro. La entrada pasa de pendiente a completa y no se repite al navegar entre secciones; los elementos terminan con opacidad 1 y sin transformación. `?motion=off` deja visibles los elementos y desactiva las respuestas al cursor. Sin errores de consola ni desplazamiento horizontal.
