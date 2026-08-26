function adminEmails() {
  return (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  return adminEmails().includes(String(email || '').toLowerCase());
}
