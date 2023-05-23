/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { computed } from "mobx";

export const computedOr = (...values: IComputedValue<boolean>[]) => computed((
  () => values.some(value => value.get())
));
