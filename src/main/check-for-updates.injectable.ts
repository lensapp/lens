/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { checkForUpdates } from "./app-updater";

const checkForUpdatesInjectable = getInjectable({
  id: "check-for-updates",
  instantiate: () => checkForUpdates,
  causesSideEffects: true,
});

export default checkForUpdatesInjectable;
