/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

const extensionMatchers = [
  /\.yaml$/,
  /\.yml$/,
  /\.json$/,
];

/**
 * Check if a fileName matches a yaml or json file name structure
 * @param fileName The fileName to check
 */
export function hasCorrectExtension(fileName: string): boolean {
  return extensionMatchers.some(matcher => matcher.test(fileName));
}
