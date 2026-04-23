export function newId(prefix: string) {
  // MVP: predictable IDs; replace with ULID later
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function nowSql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
