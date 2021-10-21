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
 * Create a new string that is `times` repetitions of `part`
 * @param part The string segment to repeat
 * @param times A non-negative count of repetitions.
 */
export function repeated(part: string, times: number): string {
  function _repeated(part: string, times: number): string {
    switch (times) {
      case 0:
        return "";
      case 1:
        return part;
      case 2:
        return part + part;
      default:
        const major = Math.pow(2, Math.floor(Math.log2(times)));
        const majorString = _repeated(part, major / 2);

        return majorString + majorString + _repeated(part, times - major);
    }
  }

  return _repeated(part, Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(times))));
}
