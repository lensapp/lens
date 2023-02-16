/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const preinstallingPhasesInjectable = getInjectable({
  id: "preinstalling-phases",
  instantiate: () => observable.set<string>(),
});

export default preinstallingPhasesInjectable;
