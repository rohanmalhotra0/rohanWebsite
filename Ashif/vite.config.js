import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseDotEnv(contents) {
  const out = {}
  const lines = String(contents || '').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key) out[key] = val
  }
  return out
}

function hydrateEnvFromLegacyFile() {
  // Support a legacy CRA-style file used at repo root: ../.env.env
  // This keeps localhost setup simple while still letting Vite use VITE_* vars.
  const legacyPath = path.resolve(__dirname, '../.env.env')
  if (!fs.existsSync(legacyPath)) return

  try {
    const legacy = parseDotEnv(fs.readFileSync(legacyPath, 'utf8'))

    // Map OPENAI_API_KEY -> VITE_OPENAI_API_KEY (for local/dev convenience).
    // Note: any VITE_* key is still bundled client-side (not recommended for production).
    if (!process.env.VITE_OPENAI_API_KEY && legacy.OPENAI_API_KEY) {
      process.env.VITE_OPENAI_API_KEY = legacy.OPENAI_API_KEY
    }
    if (!process.env.OPENAI_API_KEY && legacy.OPENAI_API_KEY) {
      process.env.OPENAI_API_KEY = legacy.OPENAI_API_KEY
    }

    if (!process.env.VITE_OPENAI_MODEL && legacy.VITE_OPENAI_MODEL) {
      process.env.VITE_OPENAI_MODEL = legacy.VITE_OPENAI_MODEL
    }
  } catch {
    // ignore legacy env parse failures
  }
}

export default defineConfig(() => {
  hydrateEnvFromLegacyFile()

  return {
    // Relative base so GitHub Pages project URLs work (/<repo>/)
    base: './',
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
