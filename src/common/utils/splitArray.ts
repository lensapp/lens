// Moved from dashboard/client/utils/arrays.ts
/**
 * This function splits an array into two sub arrays on the first instance of
 * element (from the left). If the array does not contain the element. The
 * return value is defined to be `[array, [], false]`. If the element is in
 * the array then the return value is `[left, right, true]` where `left` is
 * the elements of `array` from `[0, index)` and `right` is `(index, length)`
 * @param array the full array to split into two sub-arrays
 * @param element the element in the middle of the array
 * @returns the left and right sub-arrays which when conjoined with `element`
 *          is the same as `array`, and `true`
 */
export function splitArray<T>(array: T[], element: T): [T[], T[], boolean] {
  const index = array.indexOf(element);

  if (index < 0) {
    return [array, [], false];
  }

  return [array.slice(0, index), array.slice(index + 1, array.length), true];
}
