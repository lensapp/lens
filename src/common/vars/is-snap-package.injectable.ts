/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isSnapPackageInjectable = getInjectable({
  id: "is-snap",
  instantiate: () => Boolean(process.env.SNAP),
  causesSideEffects: true,
});

export default isSnapPackageInjectable;
