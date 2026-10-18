# 05 / EDUCA · Identidad visual

Source: Figma file `oHpYq9ulC8C4T3OtAwTLWz`, frame `1:297`, original frame 1440 × 3636 at global Y 6301. Verified through `get_design_context`, metadata and read-only property inspection.

## Composition

- White background; proportional scaling, preserving the original layout on mobile.
- Subtitle: Manrope Medium 500, 36/22 at (462, 125).
- Year: Manrope Medium 500, 28/22 at (691, 171), #363636.
- Intro: Manrope Medium 500, 28/39, centered, width 609.193359 at (410.006531, 236), with the three original paragraph breaks.
- Logo explanation: same font and width at (415.010498, 1496).
- All eleven supplied image assets retain their original slots and layer order. They are already exported with the correct crops at 5×, including the full panoramic crop and the composed black-background mark.
- `SeparadorEduca.svg` is the unchanged original Figma export, including its 1440 × 80 root dimensions, #47575D stroke and original shadow; positioned at (0, −57).
- The whole-section PNG is a comparison reference and is not included in the page bundle.

## User-requested title replacement

After supplying the original badge export, the user requested a new eye-catching title overlapping both projects. The replacement reads “MARCAS CON IDENTIDAD.” with a small “EDUCA / BRANDING” caption, a cream background, blue accent and offset shadow. The card is 800 × 174 at (320, −87), so half sits above the boundary on Personajes and half below it on EDUCA. It uses the existing Unbounded and Space Grotesk fonts. The original `BRANDING.png` is retained under `D:/Proyectos/FotosUsadasPort/unused/` but not used.

## Verification

`npm run build` passes. A separate headless Chrome QA run verified all twelve image callsites (eleven supplied images plus the separator), their decoded natural sizes and effective Figma geometry. Desktop: 1440 × 3636. Mobile: 390 px width, preserving proportional geometry with no horizontal overflow. No page errors were reported. QA artifacts and the geometry report are saved in `D:/Codex/2026-10-05/pu/educa-review`.

## Approved motion

The user approved all seven effects: staggered title entrance and hover rotation of its ornament; bottom-to-top logo reveal; bounded scroll parallax inside the panorama; subtle pointer tilt and zoom of the three photographic cards; left-to-right reveal of the logo construction graphic; independent floating of the three photographic U forms, pausing the other two when one is highlighted; and zoom/dimming emphasis between the black and white logo versions. At the user's request, the title ornament is a blue uppercase U, keeping the hover rotation.

Entrances run once per element after fonts/images are ready. Image slots, crops, layers and native dimensions are preserved; the moving panorama gets a 6% overscan with a maximum 12 px offset to prevent empty edges. Floating pauses outside the section. Keyboard focus provides the same emphasis as hover. Reduced-motion preferences and `?motion=off` show the complete static composition without entrances, floating, parallax, tilt or zoom.

Motion QA passes for all seven effects, including once-only entrances, parallax coverage at two scroll positions, tilt/zoom on all three photographs, independent U rhythms and pausing, final-logo contrast, reduced-motion mode and 390 px mobile layout. The visual report is `educa-review/motion-verification.json`. The anchor includes 120 design pixels of margin so the overlapping title is visible when navigating to EDUCA. Non-interactive reveal images do not intercept pointers over the photographic cards beneath their transparent margins.
