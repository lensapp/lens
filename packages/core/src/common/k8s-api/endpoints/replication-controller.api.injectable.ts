/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ReplicationControllerApi } from "@k8slens/kube-api";
import { getKubeApiInjectable } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import assert from "assert";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";

const replicationControllerApiInjectable = getKubeApiInjectable({
  id: "replication-controller-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "replicationControllerApi is only available in certain environments");

    return new ReplicationControllerApi({
      logger: di.inject(loggerInjectionToken),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },
});

export default replicationControllerApiInjectable;
