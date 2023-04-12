/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export declare enum Ordering {
    LESS = -1,
    EQUAL = 0,
    GREATER = 1
}
/**
 * This function switches the direction of `ordering` if `direction` is `"desc"`
 * @param ordering The original ordering (assumed to be an "asc" ordering)
 * @param direction The new desired direction
 */
export declare function rectifyOrdering(ordering: Ordering, direction: "asc" | "desc"): Ordering;
/**
 * An ascending sorting function
 * @param left An item from an array
 * @param right An item from an array
 * @returns The relative ordering in an ascending manner.
 * - Less if left < right
 * - Equal if left == right
 * - Greater if left > right
 */
export declare function sortCompare<T>(left: T, right: T): Ordering;
/**
 * This function sorts of list of items that have what should be a semver version formatted string
 * as the field `version` but if it is not loosely coercible to semver falls back to sorting them
 * alphanumerically
 */
export declare function sortBySemverVersion<T extends {
    version: string;
}>(versioned: T[]): T[];
