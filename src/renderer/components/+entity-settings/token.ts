/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { RegisteredEntitySetting } from "./extension-registrator.injectable";

export const entitySettingInjectionToken = getInjectionToken<RegisteredEntitySetting>({
  id: "entity-setting",
});
