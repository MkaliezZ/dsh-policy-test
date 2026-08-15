# dsh-policy-test

Deterministic regression tests for DSH policy decisions.

v0.1 evaluates policy fixtures without calling the protected tool body. It is intended for AgentFuse-style and other DSH pre-dispatch policies where configuration drift can silently turn an expected BLOCK into ASK/ALLOW.

Fixture cases carry tool, args, and expected decision. The runner returns pass/fail results and never dispatches the underlying tool implementation.

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
