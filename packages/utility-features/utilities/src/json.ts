/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonValue } from "type-fest";
import { result, Result } from "./result";

export const json = {
  parse: (input: string): Result<unknown, Error> => {
    try {
      return result.ok(JSON.parse(input) as unknown);
    } catch (error) {
      return result.error(error as Error);
    }
  },
  clone: <T>(input: JsonValue & T): T => JSON.parse(JSON.stringify(input)),
};
