/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect } from "react";

export function useOnUnmount(callback: () => void) {
  useEffect(() => callback, []);
}
