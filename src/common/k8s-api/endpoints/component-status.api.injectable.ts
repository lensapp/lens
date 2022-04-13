/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { ComponentStatusApi } from "./component-status.api";

const componentStatusApiInjectable = getInjectable({
  id: "component-status-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "componentStatusApi is only available in certain environments");

    return new ComponentStatusApi();
  },
});

export default componentStatusApiInjectable;
