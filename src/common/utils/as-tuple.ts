/**
 * This function changes the TS type from an array literal over the union of
 * element types to a strict tuple.
 * @param arg The array literal to be made into a tuple
 */
export function asTuple<T extends [any] | any[]>(arg: T): T {
  return arg;
}
