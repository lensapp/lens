/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const childLoggersDebugStateInjectable = getInjectable({
  id: "child-loggers",
  instantiate: () => observable.map<string, boolean>(), // Whether debug logging is enabled for child loggers
});

export default childLoggersDebugStateInjectable;
