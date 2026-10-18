# 02 / Sobre mí

Implementación React / TypeScript de la composición Figma `1:52`, 1440 × 1407, debajo de los 800 px de portada. La composición completa se escala proporcionalmente al ancho disponible, sin reorganizar las columnas. Herramientas sobresale 190 px hacia la portada.

## Recursos

Los originales rasterizados se conservan en `design-source/originals/`; la web usa variantes WebP organizadas en `src/assets/`. Los SVG negros de `src/assets/sobre-mi/icons/` se muestran en crema usando máscaras CSS; Power BI usa luminancia para conservar sus trazos blancos sobre el fondo negro. La fotografía transparente mantiene el recorte de 450 × 672 de Figma.

Animaciones automáticas de dos imágenes, precargadas y sin transiciones adicionales:

- Feliz naranja: 5.2 y 5.1; reflejada horizontalmente como la referencia.
- Pensativa: 2.1 y 2.2.
- Asombro: 3.1 y 3.2.

Las tres caras (pensativa, feliz y de asombro) cambian de imagen cada 1000 ms. El personaje de asombro se muestra por encima del separador azul, también durante los efectos de hover. `?motion=off` y la preferencia de movimiento reducido muestran el primer fotograma.

## Datos confirmados

Interacciones aprobadas: las tarjetas se elevan 7 px y aumentan su sombra al pasar el cursor; cada icono crece y gira ligeramente; los tres personajes dan un salto de 550 ms por entrada del cursor. Estos efectos solo se activan con un puntero fino que admita hover, respetan movimiento reducido y `?motion=off`. Las animaciones de expresiones mantienen sus tiempos independientes. Las áreas de los iconos y personajes permanecen estables mientras su contenido se mueve.

- Fondo naranja #FF982B. Cuadrícula de 48 px, coral #F64B32, 14% de opacidad, 1440 × 1420.
- Herramientas: (0, −190), 458 × 664. Título Unbounded Medium 27, 118%; categorías League Spartan Bold 20/22; etiquetas DM Sans Bold 16/32.
- Presentación: (505, 12). Saludo Unbounded Bold 46, 118%. Nota (0,126), 442 × 455, #D44E4B. Bio DM Sans Regular 20/27, ancho 378, justificada.
- Formación: (505,587), 442 × 556. Contenido (32,36), 378 × 482. Universidades Space Grotesk Bold 20/22; cursos DM Sans Regular 17, interlineado 242%.
- Experiencia: (0,474), 458 × 879, #6990EE. Contenido (32,42), 312 × 770, espacios 22. Título Unbounded Medium 36, 118%. Empresas DM Sans Bold 24/32.
- Skills: (991,665), 409 × 688, radio24. Contenido (32,36), 326 × 618, espacios22.
- Sombras suaves de notas/tarjetas: desplazamiento (9,13), desenfoque14, negro40–43%.

## Pendiente de confirmar antes de darla por finalizada

- Borde naranja incorporado desde `SeparadorNaranja.svg` en `Separador / Papel recortado`, situado (0,−52), 1440 × 64; el SVG conserva sus dimensiones originales de 1440 × 60. El archivo `SeparadorGrande.svg` entregado corresponde a la línea azul de la siguiente sección y se conserva sin incorporarlo.
- Familias/pesos de los estilos vinculados Giam/H2, Giam/H3, Giam/Strong y Giam/Small. Sus tamaños/interlineados sí se leyeron. Los valores actuales son provisionales y se ajustarán con la configuración original.
- El SVG SQL entregado tiene un trazo más grueso que el observado en la referencia; conviene reemplazarlo por la exportación del icono de Figma.

## Verificación

El separador azul conserva el SVG original y su geometría, sin ondulación ni reacción propia al cursor, detrás del personaje de asombro. Para reducir el borde dentado al escalar la composición, se dibuja al doble de su resolución final y se compensa la escala del contenedor; así se evita ampliar el resultado de su filtro de sombra. Verificadas su posición y dimensiones a 1920 px y a 390 px, con diferencia de redondeo menor a 0.01 px y sin desplazamiento horizontal de la página.

Compilación de producción y TypeScript correctos. Navegador sin errores de consola. Las tres animaciones recorrieron ambos fotogramas automáticamente. Foto, separador pequeño y seis fotogramas cargados. Revisada escala proporcional a 390 px sin desplazamiento horizontal de la página.
