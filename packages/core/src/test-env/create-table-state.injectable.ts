/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createTableStateInjectionToken } from "@k8slens/table";
import { getInjectable } from "@ogre-tools/injectable";

const createTableStateInjectable = getInjectable({
  id: "open-lens-table-state",
  instantiate: () => () => {},
  injectionToken: createTableStateInjectionToken,
});

export default createTableStateInjectable;
