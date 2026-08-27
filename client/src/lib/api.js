/**
 * API layer: the ONLY place the UI talks to the backend.
 *
 * submitReport(data) is called by the hero form with:
 *   { businessName: string, websiteUrl: string, email: string }
 *
 * TODO (backend): replace the stub below with a real request, e.g.
 *
 *   export async function submitReport(data) {
 *     const res = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data),
 *     });
 *     if (!res.ok) throw new Error('Failed to submit report request');
 *     return res.json();
 *   }
 */
export async function submitReport(data) {
  // Stub: pretend the request succeeded.
  return Promise.resolve({ ok: true, received: data });
}
