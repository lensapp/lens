/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowLocationInjectable from "../../../common/k8s-api/window-location.injectable";
import { lensFetchBaseUrlInjectionToken } from "../common/lens-fetch-base-url";

const lensFetchBaseUrlInjectable = getInjectable({
  id: "lens-fetch-base-url",
  instantiate: (di) => {
    const { port } = di.inject(windowLocationInjectable);

    return `https://127.0.0.1:${port}`;
  },
  injectionToken: lensFetchBaseUrlInjectionToken,
});

export default lensFetchBaseUrlInjectable;
