/**
 * The regression fixtures: the production AgentFuse policy this suite locks,
 * the decision table it must keep, and a DRIFTED variant used to prove the
 * suite actually catches configuration drift.
 *
 * Canonical policy: bash is deterministically blocked, send_email defers to
 * the human approval chain, read_file/list_dir are allowlisted, and every
 * other tool fails closed on the default.
 */

import type { PolicyConfig } from '@agentfuse/core'
import type { PolicyCase } from '../../src/index.js'

/** The production policy — this is what the AgentFuse gate compiles. */
export const canonicalPolicy: PolicyConfig = {
  denyTools: ['bash'],
  askTools: ['send_email'],
  allowTools: ['read_file', 'list_dir'],
  defaultAction: 'block',
}

/**
 * A drifted variant: the classic "loosened policy" accident — the allowlist
 * dropped and the default flipped to `allow`, so the unlisted tool goes
 * fail-open (BLOCK → ALLOW) with no code change. Exactly the class of
 * configuration drift dsh-policy-test exists to catch.
 */
export const driftedPolicy: PolicyConfig = {
  denyTools: ['bash'],
  askTools: ['send_email'],
  defaultAction: 'allow',
}

/** The decision table the canonical policy must keep. */
export const policyCases: readonly PolicyCase[] = [
  { name: 'shell execution blocked', tool: 'bash', args: { command: 'rm -rf /tmp/x' }, expect: 'BLOCK' },
  { name: 'email requires approval', tool: 'send_email', args: { to: 'ops@example.com' }, expect: 'ASK' },
  { name: 'read file allowed', tool: 'read_file', args: { path: 'README.md' }, expect: 'ALLOW' },
  { name: 'unknown tool fails closed', tool: 'unregistered_tool', args: {}, expect: 'BLOCK' },
]
