/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PodLogsQuery } from "../../../../common/k8s-api/endpoints";
import podApiInjectable from "../../../../common/k8s-api/endpoints/pod.api.injectable";
import type { ResourceDescriptor } from "../../../../common/k8s-api/kube-api";

export type CallForLogs = (params: ResourceDescriptor, query?: PodLogsQuery) => Promise<string>;

const callForLogsInjectable = getInjectable({
  id: "call-for-logs",
  instantiate: (di): CallForLogs => {
    const api = di.inject(podApiInjectable);

    return (params, query) => api.getLogs(params, query);
  },
});

export default callForLogsInjectable;
