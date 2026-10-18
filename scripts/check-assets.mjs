import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const plan = JSON.parse(await fs.readFile(path.join(root, 'scripts/assets.json'), 'utf8'))
const report = JSON.parse(await fs.readFile(path.join(root, 'reports/assets.json'), 'utf8'))
async function exactPath(relative) {
  let directory = root
  for (const part of relative.split('/')) {
    if (!(await fs.readdir(directory)).includes(part)) throw new Error(`Missing file or incorrect case: ${relative}`)
    directory = path.join(directory, part)
  }
  if (!(await fs.stat(directory)).size) throw new Error(`Empty asset: ${relative}`)
}
if (report.images.length !== plan.images.length) throw new Error('Incomplete image catalog')
let variants = 0
for (const asset of report.images) {
  await exactPath(asset.original)
  if (!asset.losslessVerified) throw new Error(`Not verified: ${asset.id}`)
  for (const variant of asset.candidates) {
    await exactPath(variant.file)
    const meta = await sharp(path.join(root, variant.file)).metadata()
    if (meta.format !== 'webp' || meta.width !== variant.width || Math.abs(meta.height - meta.width * asset.originalHeight / asset.originalWidth) > 1) throw new Error(`Wrong dimensions/format: ${variant.file}`)
    variants++
  }
}
for (const asset of plan.vectors) await exactPath(asset.output)
let localReferences = 0
for (const asset of plan.references) {
  // Archived design references are optional on machines that only build the website.
  try {
    const reference = await fs.stat(path.resolve(root, asset.output))
    if (!reference.isFile() || !reference.size) throw new Error(`Empty reference: ${asset.output}`)
    localReferences++
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
console.log(`${report.images.length} images, ${variants} variants and ${plan.vectors.length} SVGs: OK; ${localReferences}/${plan.references.length} optional archived references available`)
