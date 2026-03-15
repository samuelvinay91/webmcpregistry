import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/auto.ts'],
  format: ['esm', 'iife'],
  dts: true,
  clean: true,
  sourcemap: true,
  globalName: 'WebMCPRegistry',
  target: 'es2020',
  minify: true,
})
