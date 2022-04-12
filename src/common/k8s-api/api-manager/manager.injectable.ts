/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiManager } from "./legacy-global";

const apiManagerInjectable = getInjectable({
  id: "api-manager",
  instantiate: () => {
    const a = apiManager;

    // NOTE: this is to remove the deprecation notice
    return a;
  },
});

export default apiManagerInjectable;
