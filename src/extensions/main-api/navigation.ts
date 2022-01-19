/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { WindowManager } from "../../main/window-manager";

export function navigate(url: string) {
  return WindowManager.getInstance().navigate(url);
}
