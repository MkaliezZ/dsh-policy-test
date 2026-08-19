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

test('policy-test command evaluates fixtures through the adapter', async () => {
  const commands: Record<string, (invocation: { rawInput?: string }) => Promise<{ kind: string; text: string }>> = {}
  const { apply } = await import('../src/index.js')
  apply({ commands: { register: (d: { name: string; handler: unknown }) => { commands[d.name] = d.handler as never } } }, { evaluate: async () => 'BLOCK' as const })
  const result = await commands['policy-test']!({ rawInput: JSON.stringify([{ name: 'a', tool: 'bash', args: {}, expect: 'BLOCK' }]) })
  assert.equal(result.kind, 'success')
  const parsed = JSON.parse(result.text)
  assert.equal(parsed.summary.passed, 1)
})

test('policy-test command reports malformed JSON gracefully', async () => {
  const commands: Record<string, (invocation: { rawInput?: string }) => Promise<{ kind: string; text: string }>> = {}
  const { apply } = await import('../src/index.js')
  apply({ commands: { register: (d: { name: string; handler: unknown }) => { commands[d.name] = d.handler as never } } }, { evaluate: async () => 'ALLOW' as const })
  const result = await commands['policy-test']!({ rawInput: 'nope' })
  assert.equal(result.kind, 'error')
})