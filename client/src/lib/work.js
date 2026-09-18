// Selected work shown on the landing page. Only real projects belong here:
// entries marked `draft` render in local dev (to preview the layout) and never
// in a production build, so no placeholder ever reaches the live site.
export const WORK = [
  {
    draft: true,
    client: 'Project name',
    domain: 'client-site.com.au',
    tags: ['Local SEO', 'Technical SEO'],
    summary: 'One or two sentences on the problem, what you changed, and what happened next.',
    tone: 'blue',
  },
  {
    draft: true,
    client: 'Project name',
    domain: 'client-site.com.au',
    tags: ['AEO', 'Content'],
    summary: 'One or two sentences on the problem, what you changed, and what happened next.',
    tone: 'violet',
  },
  {
    draft: true,
    client: 'Project name',
    domain: 'client-site.com.au',
    tags: ['SEO audit', 'GEO'],
    summary: 'One or two sentences on the problem, what you changed, and what happened next.',
    tone: 'ink',
  },
];

export const visibleWork = () => WORK.filter((w) => !w.draft || import.meta.env.DEV);
