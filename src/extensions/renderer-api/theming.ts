/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ThemeStore } from "../../renderer/themes/store";

export function getActiveTheme() {
  return ThemeStore.getInstance().activeTheme;
}
