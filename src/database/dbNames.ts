export function sanitizeUserIdForFilename(userId: string): string {
  const cleaned = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return cleaned || "user";
}

export function databaseNameForUser(userId: string): string {
  return `facturion-${sanitizeUserIdForFilename(userId)}.db`;
}
