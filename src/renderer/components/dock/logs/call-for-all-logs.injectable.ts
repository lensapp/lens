/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Pod, PodLogsQuery } from "../../../../common/k8s-api/endpoints";
import callForLogsInjectable from "./call-for-logs.injectable";

const callForAllLogsInjectable = getInjectable({
  id: "call-for-all-logs",

  instantiate: (di) => {
    const callForLogs = di.inject(callForLogsInjectable);

    return async (pod: Pod, query?: PodLogsQuery) => {
      const namespace = pod.getNs();
      const name = pod.getName();
      const logs = await callForLogs({ name, namespace }, query);

      return logs;
    };
  },
});

export default callForAllLogsInjectable;
