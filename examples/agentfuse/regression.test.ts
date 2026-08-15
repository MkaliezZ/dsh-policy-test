/**
 * The AgentFuse × dsh-policy-test closed loop, as a node:test suite.
 *
 * 1. `canonical suite passes` — the production policy resolves every fixture
 *    to its expected decision: no drift, 4/4 green.
 * 2. `drifted policy flips the fail-closed case` — the SAME fixtures against a
 *    loosened variant (allowlist dropped, default flipped to `allow`) turn
 *    exactly the fail-open case red, proving the suite is a real regression
 *    lock, not a tautology.
 *
 * Run (inside a workspace where `@agentfuse/core` resolves, e.g. the
 * dsh-agentfuse-plugin monorepo or the DeepSeek Harness checkout):
 *
 *   node --import tsx/esm --test examples/agentfuse/regression.test.ts
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { runPolicyCases, summarizePolicyResults } from '../../src/index.js'
import { agentfuseEvaluator } from './agentfuse-evaluator.js'
import { canonicalPolicy, driftedPolicy, policyCases } from './fixtures.js'

test('canonical AgentFuse policy resolves every fixture as expected', async () => {
  const results = await runPolicyCases(policyCases, agentfuseEvaluator(canonicalPolicy))
  assert.deepEqual(summarizePolicyResults(results), { total: 4, passed: 4, failed: 0 })
  assert.deepEqual(results.map(r => [r.name, r.actual]), [
    ['shell execution blocked', 'BLOCK'],
    ['email requires approval', 'ASK'],
    ['read file allowed', 'ALLOW'],
    ['unknown tool fails closed', 'BLOCK'],
  ])
})

test('the same fixtures catch policy drift deterministically', async () => {
  const results = await runPolicyCases(policyCases, agentfuseEvaluator(driftedPolicy))
  const summary = summarizePolicyResults(results)

  // The loosened policy (allowlist dropped, default flipped to allow) makes
  // the unlisted tool resolve to ALLOW where the canonical table demands
  // BLOCK — a fail-open regression, and exactly the drift this suite exists
  // to catch.
  assert.deepEqual(summary, { total: 4, passed: 3, failed: 1 })
  const failures = results.filter(r => !r.pass).map(r => r.name)
  assert.deepEqual(failures, ['unknown tool fails closed'])
  assert.deepEqual(
    results.find(r => r.name === 'unknown tool fails closed'),
    { name: 'unknown tool fails closed', expected: 'BLOCK', actual: 'ALLOW', pass: false },
  )
})
