/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isAutoUpdateEnabled } from "./app-updater";

const isAutoUpdateEnabledInjectable = getInjectable({
  id: "is-auto-update-enabled",
  instantiate: () => isAutoUpdateEnabled,
  causesSideEffects: true,
});

export default isAutoUpdateEnabledInjectable;
