/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { buildVersionInjectionToken } from "../../../common/vars/build-semantic-version.injectable";
import buildVersionAsyncSyncBoxInjectable from "./box.injectable";

const buildVersionInjectable = getInjectable({
  id: "build-version",
  instantiate: (di) => {
    const buildVersionAsyncSyncBox = di.inject(buildVersionAsyncSyncBoxInjectable);

    return buildVersionAsyncSyncBox.get();
  },
  injectionToken: buildVersionInjectionToken,
});

export default buildVersionInjectable;
