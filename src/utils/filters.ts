export function filtersToKey<T extends object | undefined>(filters: T): string {
  if (!filters) {
    return "";
  }

  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${String(value).trim()}`)
    .sort()
    .join("&");
}
