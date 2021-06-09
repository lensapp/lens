/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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

/**
 * Splits an array into two parts based on the outcome of `condition`. If `true`
 * the value will be returned as part of the right array. If `false` then part of
 * the left array.
 * @param src the full array to bifurcate
 * @param condition the function to determine which set each is in
 */
export function bifurcateArray<T>(src: T[], condition: (item: T) => boolean): [falses: T[], trues: T[]] {
  const res: [T[], T[]] = [[], []];

  for (const item of src) {
    res[+condition(item)].push(item);
  }

  return res;
}
