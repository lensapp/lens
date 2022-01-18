/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Create random system name

export function getRandId({ prefix = "", suffix = "", sep = "_" } = {}) {
  const randId = () => Math.random().toString(16).slice(2);

  return [prefix, randId(), suffix].filter(s => s).join(sep);
}
