// Clone json-serializable object

export function cloneJson<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
