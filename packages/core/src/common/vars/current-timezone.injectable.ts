/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import moment from "moment-timezone";

const currentTimezoneInjectable = getInjectable({
  id: "current-timezone",
  instantiate: () => moment.tz.guess(true),
  causesSideEffects: true,
});

export default currentTimezoneInjectable;
