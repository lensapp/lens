// Clone json-serializable object

export function cloneJsonObject<T = object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
