# 08 / Contacto

Source: Figma file `oHpYq9ulC8C4T3OtAwTLWz`, frame `1:317`, 1440 × 707 at global Y 9937. Properties were read from the authenticated Figma browser editor because the Figma connector returned an unavailable-tool error. The supplied `Contacto.png` is the comparison reference, not a page asset.

## Composition

- Coral #F64B32 background; cream #F4EBDD text and icons.
- Unbounded Bold 700, 118% line height, zero tracking: GRACIAS 80 px at (98,176), width 569; farewell 36 px at (98,313), width 405; contact text 18 px at X 1019 and Y 187,281,378,477.
- Cream grid: 48 px spacing, 3 px centered strokes, 9% opacity; the 1440 × 880 grid is clipped to the final section height.
- The supplied 5× walking-character export already includes the original shadow (3 px X, 7 px Y, zero blur, black 7%). Rendered at (442,48), 505 × 628 including that shadow; the original image node is 502 × 621. No additional shadow is applied.
- The separator's Figma frame is at (-4,-44), 1444 × 64. Its supplied SVG is already clipped to the portfolio's horizontal bounds, with a 1440 × 64 root. It is rendered at (0,-44) with those root dimensions preserved.
- WhatsApp icon: Capa_1.svg, 55 × 55 at (944,170). Instagram: Layer_1.svg, 54 × 54 at (944,265). Email: Layer_1-1.svg, 65 × 65 at (938,359). LinkedIn: Frame.svg, 74 × 74 at (934,451). All original exports are used unchanged.

## Behavior and verification

The four icon/text rows are accessible links to WhatsApp, Instagram, email and LinkedIn. The existing HABLEMOS anchor now reaches this section. Like the other sections, the complete composition scales proportionally without reflow on small screens.

The production build passes. Browser QA confirmed all six image callsites load, retain their native export dimensions, and occupy the measured design slots. The desktop capture was compared against the 5× whole-section reference; the 390 px viewport preserves the same normalized geometry with no horizontal overflow. External communication links were inspected without sending messages. QA files are in `D:/Codex/2026-10-05/pu/contacto-review`.

## Approved motion

The user approved all six effects: once-only staggered text/contact entrance (600 ms, delays 0–550 ms); character sway (5.6 s, ±4 px and ±2°); contact-icon zoom/tilt (1.07×, −5°); left-to-right cream underline (300 ms); a once-per-hover GRACIAS letter wave (7 px lift, 650 ms, 55 ms between letters); and gently alternating dot opacity (1.8 s, 250 ms phases).

The original unsplit title remains the layout reference. Animated letter positions are measured from DOM ranges after fonts load, preserving its original kerning and geometry. Entrance waits for fonts and local images, begins when at least 18% of Contacto is visible, and does not reset when scrolling away. Character/dot loops pause outside the section or in a hidden browser tab. Reduced-motion preferences and `?motion=off` show the static design. Contact links provide the same icon/underline emphasis with keyboard focus; hover effects are limited to fine pointers.
