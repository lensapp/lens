/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PersistentVolumeApi } from "./persistent-volume.api";

const persistentVolumeApiInjectable = getInjectable({
  id: "persistent-volume-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "persistentVolumeApi is only available in certain environments");

    return new PersistentVolumeApi();
  },
});

export default persistentVolumeApiInjectable;
