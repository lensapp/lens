/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const windowLocationInjectable = getInjectable({
  id: "window-location",
  instantiate: () => {
    const { host, port } = window.location;

    return { host, port };
  },
  causesSideEffects: true,
});

export default windowLocationInjectable;
