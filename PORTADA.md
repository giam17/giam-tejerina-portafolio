# Portada: referencia y medidas

Implementación de `01 / Portada`, nodo `1:37` de PortafolioToWeb.
Fuente: inspección del panel de Figma por navegador (el MCP alcanzó la cuota Starter) y comparación con `D:/Proyectos/FotosUsadasPort/references/portada.png`.

- Composición: 1440 × 800. El ancho completo escala proporcionalmente sin redistribución móvil.
- Fondo #F4EBDD; azul #2035ED; coral #F64B32; blanco #FFFCEF; tinta #202324.
- Cuadrícula: paso 48, trazo 3, opacidad 13%.
- PORTA: Unbounded Black, 194, interlineado 118%, x88/y282; contorno azul 5 exterior en Figma.
- Contorno web: texto SVG con la misma fuente y máscara exterior; evita las líneas internas que aparecen al aplicar text-stroke a los glifos superpuestos de Unbounded. No es un PNG ni una exportación vectorial de Figma.
- FOLIO: Unbounded Black, 202, interlineado 118%, x36/y372, opacidad 80%.
- PORTA y FOLIO intercambian estilos con el parpadeo: ojos cerrados (`1.3_CaraRegular.png`) = PORTA con relleno azul al 80% y FOLIO con contorno exterior de 5 px; ojos abiertos (`1.1_CaraRegular.png`) = estilo original. Ambos usan el mismo estado de animación para cambiar en el mismo render, sin temporizador independiente. Las posiciones, tamaños y orden de superposición se conservan. El modo estático muestra el estilo original.
- Etiquetas: Space Grotesk Medium; navegación 16/22, franja de profesiones 24/22; relleno horizontal 16/vertical 12; radio 4.
- Los tres botones de navegación tienen fondo azul #2035ED y texto #FFFCEF. Se retiró la etiqueta/enlace `SUCRE, BOLIVIA` de la portada por indicación del usuario.
- Monograma: Dancing Script Bold 90/118%, x124/y204.
- Estrella: x64/y203, 150 × 150, 12 puntas, radio interior 78%.
- Sombras de estrella/monograma: x5, y7, blur 14.3, negro al 49%.
- Cara: original 520 × 520, esquina x886/y220, giro horario 7°. El panel muestra x822.628 para la caja delimitadora rotada.
- Fotogramas: originales 1254 × 1254 conservados en `design-source/originals/animations/regular-open.png` y `regular-blink.png`. La web usa sus variantes WebP sin recortes.
- La cara alterna automáticamente: expresión regular durante 2200 ms y sonrisa durante 700 ms, en un ciclo continuo. No depende de clic ni de pasar el cursor. `1.2_CaraRegular.png` permanece como archivo original, pero no se carga en la web.
- Entrada única al cargar: espera fuentes e imágenes, revela cuadrícula, navegación, título, etiquetas y sello; el personaje entra al final con un pequeño rebote. La entrada termina a los 1410 ms y entonces comienza el parpadeo sincronizado.
- Seguimiento del cursor de mouse: desplazamiento máximo 6 px horizontal/5 px vertical y giro adicional de 3°, suavizado con Motion. Se calcula en coordenadas de la composición para conservar la escala. Al salir de la portada o perder el foco, vuelve al reposo. Los eventos táctiles no inclinan la cara.
- El sello `g.` gira -12° y escala a 1.04 con los ojos cerrados; vuelve con un resorte al abrirlos. Usa el mismo fotograma que la cara y el título. Su hover previo se compone en una capa independiente.

Usar `/?motion=off` para comparar el primer fotograma fijo. La preferencia del sistema de reducir movimiento también detiene la secuencia.

Los ajustes ópticos de línea base (1 px en texto pequeño y FOLIO, y la línea base SVG de PORTA) se verificaron contra el PNG de referencia a 1440 × 800. Puede haber diferencias de suavizado entre el navegador y Figma.

Solo se implementó la portada. Los enlaces de navegación reservan `#sobre-mi`, `#proyectos` y `#contacto` para las siguientes secciones. No se incluyen secciones ficticias.
