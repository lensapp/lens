/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Result } from "./result";

export interface JsonParseError {
  cause: SyntaxError;
  text: string;
}

export function parse(text: string): Result<unknown, JsonParseError> {
  try {
    return {
      isOk: true,
      value: JSON.parse(text),
    };
  } catch (error) {
    return {
      isOk: false,
      error: {
        cause: error as SyntaxError,
        text,
      },
    };
  }
}
