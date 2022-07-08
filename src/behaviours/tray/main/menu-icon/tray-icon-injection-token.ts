/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

export interface TrayIcon {
  iconPath: string;
  priority: number;
  shouldBeShown: IComputedValue<boolean>;
}

export const trayIconInjectionToken = getInjectionToken<TrayIcon>({
  id: "tray-icon-token",
});
