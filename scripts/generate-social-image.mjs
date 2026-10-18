import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = new URL('../', import.meta.url)
const face = await readFile(new URL('src/assets/animations/regular-open.webp', root))
const grid = [
  ...Array.from({ length: 26 }, (_, i) => `M${i * 48} 0V630`),
  ...Array.from({ length: 15 }, (_, i) => `M0 ${i * 48}H1200`),
].join(' ')
const star = Array.from({ length: 24 }, (_, i) => {
  const angle = i * Math.PI / 12 - Math.PI / 2
  const radius = i % 2 ? 47 : 60
  return `${120 + Math.cos(angle) * radius},${184 + Math.sin(angle) * radius}`
}).join(' ')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4ebdd"/>
  <path d="${grid}" stroke="#f64b32" stroke-width="2" opacity=".14"/>
  <text x="56" y="67" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="#202324">GIAM TEJERINA</text>
  <text x="57" y="100" font-family="Arial, sans-serif" font-size="16" letter-spacing="2" fill="#202324">IDEAS CON PERSONALIDAD</text>
  <g transform="rotate(-3 920 80)">
    <rect x="730" y="48" width="414" height="57" fill="#f64b32"/>
    <rect x="730" y="41" width="414" height="57" fill="#2035ed"/>
    <text x="751" y="77" font-family="Arial, sans-serif" font-weight="700" font-size="21" fill="#f4ebdd">TECNOLOGÍA / DATOS / DISEÑO</text>
  </g>
  <text x="57" y="341" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="181" fill="none" stroke="#2035ed" stroke-width="4">PORTA</text>
  <text x="48" y="463" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="190" fill="#2035ed">FOLIO</text>
  <polygon points="${star}" fill="#f64b32"/>
  <text x="95" y="201" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="62" fill="#f4ebdd">g.</text>
  <rect x="56" y="535" width="614" height="45" rx="22" fill="#f64b32"/>
  <text x="79" y="565" font-family="Arial, sans-serif" font-weight="700" font-size="21" fill="#f4ebdd">DESARROLLO WEB · BRANDING · ILUSTRACIÓN</text>
</svg>`
await mkdir(new URL('public/', root), { recursive: true })
const output = new URL('public/og-portafolio.png', root)
const character = await sharp(face).resize(489, 489).png().toBuffer()
await sharp(Buffer.from(svg))
  .composite([{ input: character, left: 698, top: 116 }])
  .png({ compressionLevel: 9, palette: false })
  .toFile(fileURLToPath(output))
console.log('Generada public/og-portafolio.png (1200 × 630).')
