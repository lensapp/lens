export function hasKey<K extends string, V>(obj: Record<K, V>, testKey: string): testKey is K {
  return obj.hasOwnProperty(testKey);
}
