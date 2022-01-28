/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { useState } from "react";

export function useToggle(initial: boolean): [value: boolean, toggle: () => void] {
  const [val, setVal] = useState(initial);

  return [val, () => setVal(!val)];
}
