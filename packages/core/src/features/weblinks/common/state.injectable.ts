/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { WeblinkData } from "./storage.injectable";

const weblinksStateInjectable = getInjectable({
  id: "weblinks-state",
  instantiate: () => observable.map<string, WeblinkData>(),
});

export default weblinksStateInjectable;
