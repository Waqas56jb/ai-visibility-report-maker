import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { estimateCost } from '../config/pricing.js';
import { settings } from '../config/env.js';

const PROMPTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../prompts');
const BACKOFF = [1000, 3000, 8000];

export function loadPrompt(stem) {
  const file = path.join(PROMPTS_DIR, `${stem}.v1.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const parts = raw.split(/^## User\s*$/m);
  return { system: parts[0].trim(), user: (parts[1] || '').trim(), version: `${stem}.v1` };
}

export function fill(template, vars = {}) {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    const [key, fb] = expr.split('|').map((s) => s.trim());
    const val = vars[key];
    if (val == null || val === '') return fb ? fb.replace(/^["']|["']$/g, '') : '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

export class UsageTracker {
  constructor() {
    const s = settings();
    this.maxCost = s.maxCostUsd;
    this.maxCalls = s.maxOpenAiCalls;
    this.entries = [];
  }

  get cost() {
    return this.entries.reduce((s, e) => s + (e.cost || 0), 0);
  }

  get truncated() {
    return this.cost >= this.maxCost || this.entries.length >= this.maxCalls;
  }

  wouldExceed(extra = 0.02) {
    return this.cost + extra >= this.maxCost || this.entries.length + 1 > this.maxCalls;
  }

  record({ stage, model, prompt_tokens = 0, completion_tokens = 0 }) {
    const cost = estimateCost(model, prompt_tokens, completion_tokens);
    const row = { stage, model, prompt_tokens, completion_tokens, cost };
    this.entries.push(row);
    return row;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isTimeout(err) {
  const name = err?.name || '';
  const msg = String(err?.message || '');
  return name === 'TimeoutError' || name === 'AbortError' || /timeout|aborted|AbortError/i.test(msg);
}

function retryable(status, err) {
  if (isTimeout(err)) return false;
  if (status === 429 || (status >= 500 && status < 600)) return true;
  const msg = String(err?.message || '');
  return /ETIMEDOUT|fetch failed|invalid JSON|schema/i.test(msg);
}

async function openaiFetch(url, body, { timeoutMs = 20000 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is missing');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`OpenAI ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function completeJson({
  promptStem,
  vars,
  schema,
  schemaName,
  model,
  temperature = 0,
  max_tokens = 2000,
  stage,
  usage,
}) {
  const prompt = loadPrompt(promptStem);
  const payload = {
    model,
    temperature,
    max_tokens,
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: fill(prompt.user, vars) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: schemaName, strict: true, schema },
    },
  };

  let lastErr;
  for (let i = 0; i <= BACKOFF.length; i++) {
    try {
      const data = await openaiFetch('https://api.openai.com/v1/chat/completions', payload, { timeoutMs: 25000 });
      const content = data.choices?.[0]?.message?.content || '{}';
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error('schema-parse failure');
      }
      usage?.record({
        stage,
        model,
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
      });
      return { data: parsed, prompt_version: prompt.version, model };
    } catch (err) {
      lastErr = err;
      if (i === BACKOFF.length || !retryable(err.status, err)) throw err;
      await sleep(BACKOFF[i]);
    }
  }
  throw lastErr;
}

function extractResponseText(data) {
  const out = data.output || [];
  const chunks = [];
  const citations = [];
  for (const item of out) {
    const contents = item.content || [];
    for (const c of contents) {
      if (c.type === 'output_text' || c.text) chunks.push(c.text || '');
      for (const a of c.annotations || []) {
        if (a.url) citations.push(a.url);
      }
    }
  }
  if (!chunks.length && data.output_text) chunks.push(data.output_text);
  return { text: chunks.join('\n').trim(), citations: [...new Set(citations)] };
}

export async function answerAsChatGPT({ query, mode, city, country = 'AU', stage, usage, model }) {
  const system =
    'You are ChatGPT. Answer the user\'s question exactly as you would for a real person in Australia. When a question asks for recommendations, providers, comparisons or "best" options, name specific businesses you would actually suggest, in the order you\'d suggest them, with a short reason each. Include links or sources where you have them. Do not ask clarifying questions; make reasonable assumptions and answer fully in 120 to 250 words.';

  const browsing = mode === 'browsing';
  const body = {
    model,
    temperature: 0.2,
    input: [
      { role: 'system', content: system },
      { role: 'user', content: query },
    ],
  };
  if (browsing) {
    body.tools = [{ type: 'web_search' }];
    body.tool_choice = 'auto';
    if (city) {
      body.tools[0].user_location = { type: 'approximate', country, city };
    }
  }

  const timeoutMs = browsing ? 22000 : 18000;
  let lastErr;
  for (let i = 0; i <= 1; i++) {
    try {
      const started = Date.now();
      let data;
      try {
        data = await openaiFetch('https://api.openai.com/v1/responses', body, { timeoutMs });
      } catch (err) {
        if (browsing && (err.status === 400 || err.status === 404)) {
          const fallback = { ...body };
          delete fallback.tools;
          delete fallback.tool_choice;
          data = await openaiFetch('https://api.openai.com/v1/responses', fallback, { timeoutMs: 18000 });
        } else {
          throw err;
        }
      }
      const { text, citations } = extractResponseText(data);
      const usageIn = data.usage?.input_tokens || data.usage?.prompt_tokens || 0;
      const usageOut = data.usage?.output_tokens || data.usage?.completion_tokens || 0;
      usage?.record({ stage, model, prompt_tokens: usageIn, completion_tokens: usageOut });
      return { raw_answer: text, citations, latency_ms: Date.now() - started, model };
    } catch (err) {
      lastErr = err;
      if (i >= 1 || !retryable(err.status, err)) {
        if (err.status === 400 || err.status === 404) {
          return chatCompletionAnswer({ query, system, model, stage, usage });
        }
        throw err;
      }
      await sleep(BACKOFF[i]);
    }
  }
  throw lastErr;
}

async function chatCompletionAnswer({ query, system, model, stage, usage }) {
  const started = Date.now();
  const data = await openaiFetch(
    'https://api.openai.com/v1/chat/completions',
    {
    model,
    temperature: 0.2,
    max_tokens: 700,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: query },
    ],
    },
    { timeoutMs: 18000 }
  );
  usage?.record({
    stage,
    model,
    prompt_tokens: data.usage?.prompt_tokens || 0,
    completion_tokens: data.usage?.completion_tokens || 0,
  });
  return {
    raw_answer: data.choices?.[0]?.message?.content || '',
    citations: [],
    latency_ms: Date.now() - started,
    model,
  };
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}
