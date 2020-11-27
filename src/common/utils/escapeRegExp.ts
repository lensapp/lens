// Helper to sanitize / escape special chars for passing to RegExp-constructor

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
