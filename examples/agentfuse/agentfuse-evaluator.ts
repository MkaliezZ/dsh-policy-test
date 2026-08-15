/**
 * The canonical AgentFuse adapter for dsh-policy-test: turns an
 * `@agentfuse/core` policy config into a {@link PolicyEvaluator} whose
 * decision vocabulary is `ALLOW` / `ASK` / `BLOCK`.
 *
 * The adapter maps AgentFuse's policy resolution one-to-one:
 * `allow` → `ALLOW`, `ask` → `ASK` (deferral to an approval chain),
 * `block` → `BLOCK`. Because the SAME compiled policy feeds both the
 * production gate and this evaluator, a passing fixture suite is a regression
 * lock on the exact production decision table — the closed loop between
 * AgentFuse (enforce) and dsh-policy-test (verify).
 */

import { compileRules, resolvePolicy, type PolicyConfig } from '@agentfuse/core'

import type { Decision, PolicyEvaluator } from '../../src/index.js'

/**
 * Build a {@link PolicyEvaluator} from an `@agentfuse/core` policy config.
 * @param config - the exact policy the production AgentFuse gate compiles.
 * @returns an evaluator that resolves each fixture through the same engine.
 */
export function agentfuseEvaluator(config: PolicyConfig): PolicyEvaluator {
  const rules = compileRules(config)
  return (tool, args) => {
    const resolved = resolvePolicy({
      toolCallId: `policy-test:${tool}`,
      toolName: tool,
      arguments: args,
    }, rules)
    switch (resolved.action) {
      case 'allow': return 'ALLOW' as Decision
      case 'ask': return 'ASK' as Decision
      case 'block': return 'BLOCK' as Decision
    }
  }
}
