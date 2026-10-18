# 04 / Museo La Niña de Quemes

Origen: https://www.figma.com/design/oHpYq9ulC8C4T3OtAwTLWz/PortafolioToWeb?node-id=1-186

Frame 1440 × 1598, Y 2927. Fondo #FEFDF5. El navegador escala la composición entera proporcionalmente, como las secciones anteriores.

Título: Unbounded Bold, 84 px, línea 118%, #202324. Caja Figma (82, 84), ancho 674. Se aplica 1 px de corrección vertical para igualar la posición visible de los glifos.

Descripción: DM Sans Regular, 24/34 px, #202324, justificada. Fuente confirmada por el usuario. Caja (84, 330), ancho 637. Saltos de línea explícitos como en Figma y ajuste de espaciado entre palabras de -0.2 px en la cuarta línea para compensar la diferencia mínima del motor tipográfico.

Etiqueta: (840, -39), 528 × 78, radio 31, #2035ED. Texto Space Grotesk Bold 32/22, #F4EBDD, posición interna (23, 28). Sombra (9, 13), blur 14, negro 40%.

## Imágenes

Los PNG suministrados están a 5× e incluyen trazos y sombras. Las posiciones de sus imágenes completas se verificaron contra la exportación de la sección a 5× mediante comparación de píxeles interiores. No se añaden efectos CSS duplicados.

| Archivo | Posición CSS | Tamaño CSS con efectos |
| --- | --- | --- |
| capturaPC 1.png | 62, 551 | 1294 × 628 |
| capturaPC2 1.png | 542, 1117 | 813 × 413 |
| Celular.png | 752, 89 | 317 × 624 |
| Celular-1.png | 1068, 89 | 295 × 622 |

La paleta y los iconos usan los SVG originales. Los nombres de tecnologías estaban convertidos en contornos en Figma; se extrajeron sin alterarlos de la exportación original a 5× y se guardaron en `src/assets/museo/labels`. La exportación completa es solo una referencia y no se importa en la aplicación.

## Interacciones aprobadas

- Entrada al llegar a la sección, una sola vez: texto primero y capturas después, 18 px de desplazamiento y 600 ms de duración.
- Inclinación de los teléfonos según el cursor: hasta 3° en X y 3.5° en Y, con retorno mediante resortes.
- Las cuatro capturas abren un visor nativo con bloqueo del scroll, cierre mediante botón, Escape o clic fuera, y devolución del foco al activador.
- Los bloques de la paleta suben 5 px al pasar el cursor.
- Los iconos de tecnologías aumentan a escala 1.06 al pasar el cursor, sin salto.

Los efectos de movimiento se desactivan con la preferencia del sistema de reducir movimiento o con `?motion=off`. Los hitboxes permanecen fijos y las transformaciones se aplican a sus elementos interiores.
