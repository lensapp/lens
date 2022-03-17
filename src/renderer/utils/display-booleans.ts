/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";

export function displayBooleans(shouldShow: boolean | undefined, from: React.ReactNode): React.ReactNode {
  if (shouldShow) {
    if (typeof from === "boolean") {
      return from.toString();
    }

    if (Array.isArray(from)) {
      return from.map(node => displayBooleans(shouldShow, node));
    }
  }

  return from;
}
