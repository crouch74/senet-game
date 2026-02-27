import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const indexHtml = join(distDir, 'index.html')
const notFoundHtml = join(distDir, '404.html')
const noJekyll = join(distDir, '.nojekyll')

if (!existsSync(indexHtml)) {
  console.error('❌ prepare-pages: dist/index.html is missing. Run the build first.')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
writeFileSync(noJekyll, '')

console.log('✅ prepare-pages: copied index.html -> 404.html for SPA refresh support')
console.log('✅ prepare-pages: wrote .nojekyll in dist root')
