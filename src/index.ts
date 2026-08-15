export type Decision = 'ALLOW' | 'ASK' | 'BLOCK'
export interface PolicyCase { name: string; tool: string; args: unknown; expect: Decision }
export interface PolicyResult { name: string; expected: Decision; actual: Decision; pass: boolean }
export type PolicyEvaluator = (tool: string, args: unknown) => Promise<Decision> | Decision

export async function runPolicyCases(cases: readonly PolicyCase[], evaluate: PolicyEvaluator): Promise<PolicyResult[]> {
  const results: PolicyResult[] = []
  for (const testCase of cases) {
    const actual = await evaluate(testCase.tool, structuredClone(testCase.args))
    results.push({ name: testCase.name, expected: testCase.expect, actual, pass: actual === testCase.expect })
  }
  return results
}

export function summarizePolicyResults(results: readonly PolicyResult[]) {
  const passed = results.filter(r => r.pass).length
  return { total: results.length, passed, failed: results.length - passed }
}

export const name = 'policy-test'
export const inject = ['commands']
export function apply(ctx: any, config: { evaluate?: PolicyEvaluator } = {}): void {
  ctx.commands.register({
    name: 'policy-test',
    description: 'Evaluate policy fixtures without dispatching protected tool bodies.',
    recordInput: false,
    async handler(invocation: any) {
      if (!config.evaluate) return { kind: 'error', text: 'policy-test requires an explicit evaluator adapter' }
      const raw = String(invocation.args?.join(' ') ?? '').trim()
      const cases = JSON.parse(raw) as PolicyCase[]
      const results = await runPolicyCases(cases, config.evaluate)
      return { kind: 'success', text: JSON.stringify({ summary: summarizePolicyResults(results), results }, null, 2) }
    },
  })
}
