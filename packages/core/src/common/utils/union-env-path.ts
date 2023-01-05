/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import * as iter from "./iter";

/**
 * Join all entires with a PATH env var delimated string together
 * @param PATHs Any number of PATH env variables
 *
 * NOTE: This function does not attempt to handle any sort of escape sequences since after testing
 * it was found that `zsh` (at least on `macOS`) does not when trying to find programs
 */
export function unionPATHs(...PATHs: string[]): string {
  const entries = new Set(iter.filterFlatMap(PATHs, PATH => PATH.split(path.delimiter)));

  return iter.join(entries.values(), path.delimiter);
}
