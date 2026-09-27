import { afterAll, expect, test } from 'vitest'
import { build } from 'esbuild'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const outputDir = await mkdtemp(join(tmpdir(), 'mystash-lambda-'))
const config = await readFile(resolve('serverless.yaml'), 'utf8')
const entries = [...config.matchAll(/handler: dist\/(.+)\.handler/g)].map(match => match[1])

afterAll(() => rm(outputDir, { recursive: true, force: true }))

test('discovers the configured Lambda entry points', () => {
  expect(entries.length).toBeGreaterThan(0)
})

for (const entry of entries) {
  test(`${entry} bundle exports a Node 24 compatible handler`, async () => {
    const outfile = join(outputDir, `${entry.replaceAll('/', '-')}.cjs`)
    await build({
      entryPoints: [resolve('src', `${entry}.ts`)],
      outfile,
      bundle: true,
      platform: 'node',
      target: 'node24',
      format: 'cjs',
    })
    const { handler } = require(outfile)
    expect(typeof handler).toBe('function')
    // Lambda Node 24 rejects non-streaming handlers with a callback argument.
    expect(handler.length).toBeLessThanOrEqual(2)
    expect(handler.constructor.name).toBe('AsyncFunction')
  })
}
