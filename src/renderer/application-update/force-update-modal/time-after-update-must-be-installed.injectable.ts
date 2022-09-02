/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const timeAfterUpdateMustBeInstalledInjectable = getInjectable({
  id: "time-after-update-must-be-installed",
  instantiate: () => THIRTY_DAYS,
});

export default timeAfterUpdateMustBeInstalledInjectable;
