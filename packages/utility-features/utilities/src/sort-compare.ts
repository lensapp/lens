/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import semver, { coerce } from "semver";

export enum Ordering {
  LESS = -1,
  EQUAL = 0,
  GREATER = 1,
}

/**
 * This function switches the direction of `ordering` if `direction` is `"desc"`
 * @param ordering The original ordering (assumed to be an "asc" ordering)
 * @param direction The new desired direction
 */
export function rectifyOrdering(ordering: Ordering, direction: "asc" | "desc"): Ordering {
  if (direction === "desc") {
    return -ordering;
  }

  return ordering;
}

/**
 * An ascending sorting function
 * @param left An item from an array
 * @param right An item from an array
 * @returns The relative ordering in an ascending manner.
 * - Less if left < right
 * - Equal if left == right
 * - Greater if left > right
 */
export function sortCompare<T>(left: T, right: T): Ordering {
  if (left < right) {
    return Ordering.LESS;
  }

  if (left === right) {
    return Ordering.EQUAL;
  }

  return Ordering.GREATER;
}

/**
 * This function sorts of list of items that have what should be a semver version formatted string
 * as the field `version` but if it is not loosely coercible to semver falls back to sorting them
 * alphanumerically
 */
export function sortBySemverVersion<T extends { version: string }>(versioned: T[]): T[] {
  return versioned
    .map(versioned => ({
      __version: coerce(versioned.version, { loose: true }),
      raw: versioned,
    }))
    .sort((left, right) => {
      if (left.__version && right.__version) {
        return semver.compare(right.__version, left.__version);
      }

      if (!left.__version && right.__version) {
        return Ordering.GREATER;
      }

      if (left.__version && !right.__version) {
        return Ordering.LESS;
      }

      return sortCompare(left.raw.version, right.raw.version);
    })
    .map(({ raw }) => raw);
}
