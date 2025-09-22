//==============================================================
// FILE: src/lib/slug.ts
// DESCRIPTION: Tiny slugify helper for collection names.
//==============================================================

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
