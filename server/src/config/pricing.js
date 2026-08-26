/** USD per 1M tokens */
export const PRICING = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.6 },
};

export function estimateCost(model, promptTokens = 0, completionTokens = 0) {
  const p = PRICING[model] || PRICING['gpt-4o-mini'];
  return (promptTokens / 1e6) * p.input + (completionTokens / 1e6) * p.output;
}
