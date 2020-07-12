// Create random filename

export function randomFileName({ prefix = "", suffix = "", sep = "__" } = {}) {
  const randId = () => Math.random().toString(16).substr(2);
  return [prefix, randId(), suffix].filter(s => s).join(sep);
}
