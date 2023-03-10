/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";
import { getGlobalOverride } from "@k8slens/test-utils";

export default getGlobalOverride(periodicalCheckForUpdatesInjectable, () => ({
  start: () => {},
  stop: () => {},
  started: false,
}));
