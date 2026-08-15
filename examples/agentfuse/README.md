# AgentFuse × dsh-policy-test: the closed loop

This example wires the two halves together:

- **AgentFuse** (`@agentfuse/core`) — the production pre-dispatch gate:
  deterministic `allow` / `ask` / `block` with evidence.
- **dsh-policy-test** — the regression lock: the same policy, evaluated
  against a fixture table in CI.

`agentfuse-evaluator.ts` compiles the SAME `PolicyConfig` the production gate
compiles and maps its resolution to dsh-policy-test's `ALLOW` / `ASK` / `BLOCK`
vocabulary. Because both sides share one engine, a green suite means the
production decision table has not drifted; a red suite names exactly which
decision changed.

## Files

- `fixtures.ts` — the canonical policy, its decision table, and a **loosened
  variant** (allowlist dropped, `defaultAction` flipped to `allow`) used to
  prove the suite catches real drift.
- `agentfuse-evaluator.ts` — the `PolicyEvaluator` adapter.
- `regression.test.ts` — the loop as a `node:test` suite: 4/4 green against the
  canonical policy, and the same fixtures turn the fail-closed case red
  against the drifted variant.

## Run

`@agentfuse/core` must resolve from `node_modules` (it is un-published; link or
vendor it — it lives at `packages/core` in
[`MkaliezZ/dsh-agentfuse-plugin`](https://github.com/MkaliezZ/dsh-agentfuse-plugin),
and at `vendor/agentfuse-core` in the DeepSeek Harness checkout):

```bash
node --import tsx/esm --test examples/agentfuse/regression.test.ts
```

## The story in one sentence

AgentFuse enforces the policy in production; dsh-policy-test makes the same
policy a CI artifact, so configuration drift — the silent killer of
fail-closed tool authorization — turns red instead of turning into an
unexpected ALLOW.
