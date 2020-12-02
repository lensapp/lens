// Create random system name

export function getRandId({ prefix = "", suffix = "", sep = "_" } = {}) {
  const randId = () => Math.random().toString(16).substr(2);

  return [prefix, randId(), suffix].filter(s => s).join(sep);
}
