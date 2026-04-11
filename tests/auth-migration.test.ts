import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('Better Auth migration', () => {
  it('removes Clerk from runtime dependencies', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> }

    assert.equal(pkg.dependencies?.['@clerk/nextjs'], undefined)
    assert.ok(pkg.dependencies?.['better-auth'])
  })

  it('keeps Better Auth backed by Prisma models', () => {
    const schema = read('prisma/schema.prisma')

    for (const model of ['model User', 'model Session', 'model Account', 'model Verification']) {
      assert.match(schema, new RegExp(model))
    }

    assert.match(schema, /onboardingComplete\s+Boolean\s+@default\(false\)/)
  })

  it('mounts Better Auth on the expected Next.js route', () => {
    const route = read('src/app/api/auth/[...all]/route.ts')

    assert.match(route, /toNextJsHandler\(auth\)/)
    assert.match(route, /export const \{ GET, POST \}/)
  })
})
