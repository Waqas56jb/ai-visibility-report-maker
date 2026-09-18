function obj(properties, required) {
  return { type: 'object', additionalProperties: false, required, properties };
}

export const BusinessSummary = obj(
  {
    canonical_name: { type: 'string' },
    name_variants: { type: 'array', items: { type: 'string' } },
    category: { type: 'string' },
    sub_services: { type: 'array', items: { type: 'string' } },
    service_area: obj(
      {
        city: { type: ['string', 'null'] },
        region: { type: ['string', 'null'] },
        country: { type: 'string' },
        suburbs: { type: 'array', items: { type: 'string' } },
        is_online_only: { type: 'boolean' },
      },
      ['city', 'region', 'country', 'suburbs', 'is_online_only']
    ),
    target_customers: { type: 'array', items: { type: 'string' } },
    topics: { type: 'array', items: { type: 'string' } },
    competitor_types: { type: 'array', items: { type: 'string' } },
    positioning: { type: 'string' },
    confidence: { type: 'number' },
  },
  [
    'canonical_name',
    'name_variants',
    'category',
    'sub_services',
    'service_area',
    'target_customers',
    'topics',
    'competitor_types',
    'positioning',
    'confidence',
  ]
);

export const QuerySet = obj(
  {
    queries: {
      type: 'array',
      items: obj(
        {
          text: { type: 'string' },
          category: {
            type: 'string',
            enum: ['discovery', 'comparison', 'brand', 'informational', 'local', 'longtail'],
          },
          topic: { type: 'string' },
          intent: { type: 'string', enum: ['find_provider', 'compare', 'evaluate_brand', 'learn'] },
          mentions_target: { type: 'boolean' },
          mentions_competitor: { type: 'boolean' },
        },
        ['text', 'category', 'topic', 'intent', 'mentions_target', 'mentions_competitor']
      ),
    },
  },
  ['queries']
);

export const MentionExtraction = obj(
  {
    named_entities: {
      type: 'array',
      items: obj(
        {
          name: { type: 'string' },
          is_directory: { type: 'boolean' },
          is_target: { type: 'boolean' },
        },
        ['name', 'is_directory', 'is_target']
      ),
    },
    target_mentioned: { type: 'boolean' },
    target_position: { type: ['integer', 'null'] },
    target_cited: { type: 'boolean' },
    target_sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'not_mentioned'] },
    target_description: { type: ['string', 'null'] },
    competitors_named: { type: 'array', items: { type: 'string' } },
    answer_recommends_providers: { type: 'boolean' },
  },
  [
    'named_entities',
    'target_mentioned',
    'target_position',
    'target_cited',
    'target_sentiment',
    'target_description',
    'competitors_named',
    'answer_recommends_providers',
  ]
);

export const MentionBatch = obj(
  {
    items: {
      type: 'array',
      items: obj(
        {
          index: { type: 'integer' },
          named_entities: MentionExtraction.properties.named_entities,
          target_mentioned: { type: 'boolean' },
          target_position: { type: ['integer', 'null'] },
          target_cited: { type: 'boolean' },
          target_sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'not_mentioned'] },
          target_description: { type: ['string', 'null'] },
          competitors_named: { type: 'array', items: { type: 'string' } },
          answer_recommends_providers: { type: 'boolean' },
        },
        [
          'index',
          'named_entities',
          'target_mentioned',
          'target_position',
          'target_cited',
          'target_sentiment',
          'target_description',
          'competitors_named',
          'answer_recommends_providers',
        ]
      ),
    },
  },
  ['items']
);

export const Recommendations = obj(
  {
    summary: { type: 'string' },
    recommendations: {
      type: 'array',
      items: obj(
        {
          title: { type: 'string' },
          why_it_matters: { type: 'string' },
          what_to_do: { type: 'string' },
          expected_impact: { type: 'string', enum: ['high', 'medium', 'low'] },
          effort: { type: 'string', enum: ['low', 'medium', 'high'] },
          service_key: { type: 'string', enum: ['technical', 'local', 'content', 'aiso'] },
          evidence_refs: { type: 'array', items: { type: 'string' } },
        },
        ['title', 'why_it_matters', 'what_to_do', 'expected_impact', 'effort', 'service_key', 'evidence_refs']
      ),
    },
  },
  ['summary', 'recommendations']
);
