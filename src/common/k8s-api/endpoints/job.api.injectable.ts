/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { JobApi } from "./job.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";

const jobApiInjectable = getInjectable({
  id: "job-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "jobApi is only available in certain environments");

    return new JobApi();
  },

  injectionToken: kubeApiInjectionToken,
});

export default jobApiInjectable;
