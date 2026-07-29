export function createId(): string {
  return `invoice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
