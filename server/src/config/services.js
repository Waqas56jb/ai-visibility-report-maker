export const SERVICES = {
  aiso: {
    name: 'AI Search Optimisation',
    description: 'Make your site readable, trustworthy and citable by AI systems.',
    cta: 'https://makeflow.com.au/contact?s=aiso',
  },
  chatbot: {
    name: 'AI Chatbots',
    description: 'Turn AI-referred visitors into booked calls.',
    cta: 'https://makeflow.com.au/contact?s=chatbot',
  },
  automation: {
    name: 'AI Automation',
    description: 'Reviews, listings and content on autopilot.',
    cta: 'https://makeflow.com.au/contact?s=automation',
  },
  custom: {
    name: 'Custom AI Solutions',
    description: 'Anything else the report uncovered.',
    cta: 'https://makeflow.com.au/contact',
  },
};

export const SERVICE_KEYS = Object.keys(SERVICES);

export function serviceKeysWithDescriptions() {
  return Object.entries(SERVICES)
    .map(([key, s]) => `${key}: ${s.name}. ${s.description}`)
    .join('\n');
}
