/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export type AppUpdaterState = {
  status: "idle";
} | {
  status: "update-install-ready";
};

const appUpdaterStateInjectable = getInjectable({
  id: "app-updater-state",
  instantiate: () => observable.box<AppUpdaterState>({
    status: "idle",
  }),
});

export default appUpdaterStateInjectable;
