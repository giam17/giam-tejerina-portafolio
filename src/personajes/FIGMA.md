# 06 / Personajes con personalidad

Figma file `oHpYq9ulC8C4T3OtAwTLWz`, frame `1:229`, inspected through the signed-in browser.

- Original frame: 1440 × 1776, background #468DED, global Y 4525.
- Proportional scaling follows the existing sections; no mobile rearrangement.
- Headline: Titan One Regular, 69 px, 118% line height, −3% tracking.
- BOCETOS: Bungee Shade Regular, 128 px, 118% line height.
- Emotion labels: Bowlby One SC Regular, 36 px, 118% line height.
- Category badge: Bowlby One Regular, 40 px, 22 px line height; 519 × 238 at (0, −152).
- Description: existing Giam/Body treatment, DM Sans Regular, 24/34, justified.
- Clouds retain the source PNG alpha and the individual Figma opacities (100%, 90%, 78%, 70%). The two bottom clouds are mirrored relative to the exported PNG.
- Character PNGs already contain layer rotation/flipping. Rotated exports use their actual export bounds rather than being rotated a second time.

## Panel accents

The user supplied `Trazos.svg` (885 × 371) and `Trazos2.svg` (901 × 384), containing the 23 original corner paths. Their group positions were confirmed through the Figma browser. SVG export bounds include a 1 px stroke margin; final section positions are (111.897491, 829.19873) and (388.264954, 1261.351074). Both retain the original 2 px strokes, #76716D color, rounded caps, and transparency. Layer order follows Figma, including the resting warrior above the lower accents.

The whole-section reference is used only for comparison and is not shipped as a page image.

## Approved motion

- Clouds float 24 px horizontally in alternating directions / 18 px vertically with independent 6–8.8 s cycles; motion pauses outside the viewport. Opacity and mirroring remain on separate layers. The original 6/5 px drift was increased after the user reported that movement was imperceptible.
- All characters zoom to 1.04 on mouse hover. The six label buttons highlight and zoom their corresponding character on hover or keyboard focus (also usable by touch focus).
- The original SVG paths draw once as their panel enters view, with 65 ms staggering and 650 ms per stroke.
- The main warrior follows the mouse with a spring: up to 3° rotation, 3 px horizontal movement and 2 px vertical movement, resetting on pointer leave/cancel or window blur.
- Each panel's three characters enter once with a 16 px rise and opacity transition, 600 ms duration and 140 ms staggering. Images are decoded before the entrance starts.
- Reduced-motion preferences and `?motion=off` show the original static composition immediately; entrance, zoom, floating, drawing and pointer tracking are disabled.
