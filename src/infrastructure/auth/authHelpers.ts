export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createUserId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
