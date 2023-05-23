/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export const getMatchFor =
  (...patterns: RegExp[]) =>
  (reference: string) => {
    for (const pattern of patterns) {
      const match = reference.match(pattern);

      if (match) {
        return match;
      }
    }

    return undefined;
  };
