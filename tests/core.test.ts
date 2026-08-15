import test from 'node:test'
import assert from 'node:assert/strict'
import { runPolicyCases, summarizePolicyResults } from '../src/index.js'

test('evaluates fixtures without requiring a tool body', async () => {
  let evaluations = 0
  const results = await runPolicyCases([
    { name: 'block shell', tool: 'bash', args: { command: 'rm -rf x' }, expect: 'BLOCK' },
    { name: 'allow read', tool: 'read_file', args: { path: 'README.md' }, expect: 'ALLOW' },
  ], (tool) => { evaluations++; return tool === 'bash' ? 'BLOCK' : 'ALLOW' })
  assert.equal(evaluations, 2)
  assert.deepEqual(summarizePolicyResults(results), { total: 2, passed: 2, failed: 0 })
})

test('reports mismatched decision deterministically', async () => {
  const results = await runPolicyCases([{ name: 'x', tool: 'write', args: {}, expect: 'BLOCK' }], () => 'ASK')
  assert.deepEqual(results[0], { name: 'x', expected: 'BLOCK', actual: 'ASK', pass: false })
})

test('clones args before handing them to evaluator', async () => {
  const original = { nested: { value: 1 } }
  await runPolicyCases([{ name: 'x', tool: 't', args: original, expect: 'ALLOW' }], (_tool, args: any) => { args.nested.value = 9; return 'ALLOW' })
  assert.equal(original.nested.value, 1)
})
