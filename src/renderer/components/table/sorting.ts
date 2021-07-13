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

import type { TableSortCallback } from "./table";
import { Ordering, rectifyOrdering, sortCompare } from "../../utils";
import { zip } from "lodash";

/**
 * Returns a new array of sorted by the parts returned by `sortingCallback`
 * @param rawItems The initial items to sort
 * @param sortingCallback the sorting callback function, if undefined then no sorting takes place
 * @param rawOrderBy a string that should be either `"asc"` or `"desc"` and defauls to `"asc"` if not
 */
export function getSorted<T>(rawItems: T[], sortingCallback: TableSortCallback<T> | undefined, orderByRaw: string): T[] {
  if (typeof sortingCallback !== "function") {
    return rawItems;
  }

  const orderBy = orderByRaw === "asc" || orderByRaw === "desc" ? orderByRaw : "asc";
  const sortData = rawItems.map((item, index) => ({
    index,
    sortBy: sortingCallback(item),
  }));

  sortData.sort((left, right) => {
    if (!Array.isArray(left.sortBy) && !Array.isArray(right.sortBy)) {
      return rectifyOrdering(sortCompare(left.sortBy, right.sortBy), orderBy);
    }

    const leftSortBy = [left.sortBy].flat();
    const rightSortBy = [right.sortBy].flat();

    if (leftSortBy.length !== rightSortBy.length) {
      return rectifyOrdering(sortCompare(leftSortBy.length, rightSortBy.length), orderBy);
    }

    for (const [nextL, nextR] of zip(leftSortBy, rightSortBy)) {
      const sortOrder = rectifyOrdering(sortCompare(nextL, nextR), orderBy);

      if (sortOrder !== Ordering.EQUAL) {
        return sortOrder;
      }
    }

    return Ordering.EQUAL;
  });

  const res = [];

  for (const { index } of sortData) {
    res.push(rawItems[index]);
  }

  return res;
}
