/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TableSortCallback } from "./table";
import { Ordering, rectifyOrdering, sortCompare, tuple } from "../../utils";

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
    const zipIter = tuple.zip(leftSortBy, rightSortBy);
    let r = zipIter.next();

    for (; !r.done; r = zipIter.next()) {
      const [nextL, nextR] = r.value;
      const sortOrder = rectifyOrdering(sortCompare(nextL, nextR), orderBy);

      if (sortOrder !== Ordering.EQUAL) {
        return sortOrder;
      }
    }

    const [leftRest, rightRest] = r.value;

    return leftRest.length - rightRest.length;
  });

  const res = [];

  for (const { index } of sortData) {
    res.push(rawItems[index]);
  }

  return res;
}
