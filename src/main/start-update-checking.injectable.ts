/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { startUpdateChecking } from "./app-updater";
import isAutoUpdateEnabledInjectable from "./is-auto-update-enabled.injectable";

const startUpdateCheckingInjectable = getInjectable({
  id: "start-update-checking",

  instantiate: (di) => startUpdateChecking({
    isAutoUpdateEnabled: di.inject(isAutoUpdateEnabledInjectable),
  }),

  causesSideEffects: true,
});

export default startUpdateCheckingInjectable;
