/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import periodicalCheckForUpdatesInjectable from "./periodical-check-for-updates.injectable";
import { getGlobalOverride } from "../../../../../common/test-utils/get-global-override";

export default getGlobalOverride(periodicalCheckForUpdatesInjectable, () => ({
  start: async () => {},
  stop: async () => {},
  started: false,
}));
