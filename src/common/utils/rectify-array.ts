/**
 * rectify condences the single item or array of T type, to an array.
 * @param items either one item or an array of items
 * @returns a list of items
 */
export function rectify<T>(items: T | T[]): T[] {
  return Array.isArray(items) ? items : [items];
}
