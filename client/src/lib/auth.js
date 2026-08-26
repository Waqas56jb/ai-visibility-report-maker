/**
 * Auth API layer — the ONLY place auth pages talk to the "backend".
 *
 * Replace with real API calls later.
 *
 * Each stub waits 1200ms, logs the payload, and resolves successfully
 * so the UI can be wired to a real server without changing page code.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(data) {
  console.log('login', data);
  await delay(1200);
  return { ok: true };
}

export async function signup(data) {
  console.log('signup', data);
  await delay(1200);
  return { ok: true };
}

export async function forgotPassword(email) {
  console.log('forgotPassword', email);
  await delay(1200);
  return { ok: true };
}

export async function resetPassword(password) {
  console.log('resetPassword', { password });
  await delay(1200);
  return { ok: true };
}
