/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Get an ordering function based on the function getter
 */
export function byValue<T>(getOrderValue: (src: T) => number): (left: T, right: T) => number {
  return (left, right) => {
    const leftValue = getOrderValue(left);
    const rightValue = getOrderValue(right);

    return leftValue - rightValue;
  };
}
