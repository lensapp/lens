/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const extensionsWithoutInstancesByNameInjectable = getInjectable({
  id: "extensions-without-instances-by-name",
  instantiate: () => observable.set<string>(),
});

export default extensionsWithoutInstancesByNameInjectable;
