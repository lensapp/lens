/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const downloadPlatformUpdateInjectable = getInjectable({
  id: "download-platform-update",

  instantiate: () => {
    return async () => {};
  },
});

export default downloadPlatformUpdateInjectable;
