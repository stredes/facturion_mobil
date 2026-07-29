export function createId(prefix?: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${suffix}` : `gen-${suffix}`;
}
