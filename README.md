# dsh-policy-test

Deterministic regression tests for DSH policy decisions.

v0.1 evaluates policy fixtures without calling the protected tool body. It is intended for AgentFuse-style and other DSH pre-dispatch policies where configuration drift can silently turn an expected BLOCK into ASK/ALLOW.

Fixture cases carry tool, args, and expected decision. The runner returns pass/fail results and never dispatches the underlying tool implementation.

## AgentFuse integration (the closed loop)

The evaluator adapter plugs directly into
[`@agentfuse/core`](https://github.com/MkaliezZ/dsh-agentfuse-plugin) — the
engine behind the `dsh-agentfuse` pre-dispatch gate. Compile the **same**
`PolicyConfig` the production gate compiles, and the fixture table becomes a
regression lock on the production decision table: policy drift (e.g. a
default silently flipped to `allow`) turns red instead of turning into an
unexpected `ALLOW`.

See [`examples/agentfuse/`](examples/agentfuse/README.md) for the adapter,
fixtures, and a drift-detection test.

## Non-claims

- no physical tool execution in test mode;
- not a sandbox;
- policy adapters must be supplied explicitly;
- passing fixtures do not prove production configuration is identical unless that configuration is what the adapter evaluates.

## Development

```bash
npm install
npm test
```

MIT
