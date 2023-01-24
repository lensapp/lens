/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonValue } from "type-fest";

export function parse(input: string): JsonValue {
  return JSON.parse(input);
}
