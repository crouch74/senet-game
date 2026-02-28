import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_DIR = path.resolve(__dirname, '..')
const EN_LOCALE_PATH = path.resolve(__dirname, '../locales/en.json')

const flattenKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : []
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

const walkFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkFiles(fullPath)
    return /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [fullPath] : []
  })

const collectUsedKeys = () => {
  const files = walkFiles(SRC_DIR)
  const patterns = [/\bt\(\s*['"]([^'"]+)['"]/g, /i18nKey=\s*['"]([^'"]+)['"]/g]
  const keys = new Set<string>()

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    for (const pattern of patterns) {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text))) {
        if (!match[1].includes('${')) {
          keys.add(match[1])
        }
      }
    }
  }

  return [...keys].sort()
}

describe('localization coverage', () => {
  it('has english source entries for every statically referenced translation key', () => {
    const en = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'))
    const enKeys = new Set(flattenKeys(en))
    const missing = collectUsedKeys().filter((key) => !enKeys.has(key))

    expect(missing).toEqual([])
  })
})
