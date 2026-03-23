/**
 * TITAN OS — Icon Generator
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install canvas (or @napi-rs/canvas)
 *
 * Generates icon-192.png and icon-512.png in /public/
 */

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, size, size)

  // Outer border glow
  const borderWidth = size * 0.04
  ctx.strokeStyle = '#00F0FF'
  ctx.lineWidth = borderWidth
  ctx.shadowColor = '#00F0FF'
  ctx.shadowBlur = size * 0.1
  const radius = size * 0.18
  const padding = borderWidth
  ctx.beginPath()
  ctx.roundRect(padding, padding, size - padding * 2, size - padding * 2, radius)
  ctx.stroke()

  // Inner glow ring
  ctx.strokeStyle = 'rgba(0,240,255,0.2)'
  ctx.lineWidth = borderWidth * 0.5
  ctx.shadowBlur = 0
  const innerPad = padding + borderWidth * 1.5
  ctx.beginPath()
  ctx.roundRect(innerPad, innerPad, size - innerPad * 2, size - innerPad * 2, radius * 0.8)
  ctx.stroke()

  // "T" letter (Orbitron-style bold)
  const fontSize = size * 0.55
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = '#00F0FF'
  ctx.shadowBlur = size * 0.15
  ctx.font = `900 ${fontSize}px "Arial Black", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('T', size / 2, size / 2 + fontSize * 0.05)

  // Neon blue dot below letter
  const dotSize = size * 0.05
  ctx.fillStyle = '#00F0FF'
  ctx.shadowColor = '#00F0FF'
  ctx.shadowBlur = dotSize * 3
  ctx.beginPath()
  ctx.arc(size / 2, size * 0.82, dotSize, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer('image/png')
}

try {
  const buf192 = generateIcon(192)
  const buf512 = generateIcon(512)

  writeFileSync(join(publicDir, 'icon-192.png'), buf192)
  writeFileSync(join(publicDir, 'icon-512.png'), buf512)

  console.log('✅ Icons generated: icon-192.png, icon-512.png')
} catch (err) {
  console.error('❌ Could not generate icons:', err.message)
  console.log('   Install canvas: npm install canvas')
  console.log('   Or use any 192x192 and 512x512 PNG files named icon-192.png / icon-512.png')
}
