/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { StorageClassApi } from "./storage-class.api";

const storageClassApiInjectable = getInjectable({
  id: "storage-class-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "storageClassApi is only available in certain environments");

    return new StorageClassApi();
  },
});

export default storageClassApiInjectable;
