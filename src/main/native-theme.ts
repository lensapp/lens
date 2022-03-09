/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { nativeTheme } from "electron";
import { broadcastMessage } from "../common/ipc";
import { setNativeThemeChannel } from "../common/ipc/native-theme";

export function broadcastNativeThemeOnUpdate() {
  nativeTheme.on("updated", () => {
    broadcastMessage(setNativeThemeChannel, getNativeColorTheme());
  });
}

export function getNativeColorTheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}
