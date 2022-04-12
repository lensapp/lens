/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { createStoresAndApisInjectionToken } from "../create-stores-apis.token";
import { JobApi } from "./job.api";

const jobApiInjectable = getInjectable({
  id: "job-api",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "jobApi is only available in certain environments");

    return new JobApi();
  },
});

export default jobApiInjectable;
