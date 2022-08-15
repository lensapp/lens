/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PodLogsQuery } from "../../../../common/k8s-api/endpoints";
import type { ResourceDescriptor } from "../../../../common/k8s-api/kube-api";
import loggerInjectable from "../../../../common/logger.injectable";
import openSaveFileDialogInjectable from "../../../utils/save-file.injectable";
import callForLogsInjectable from "./call-for-logs.injectable";

const downloadAllLogsInjectable = getInjectable({
  id: "download-all-logs",

  instantiate: (di) => {
    const callForLogs = di.inject(callForLogsInjectable);
    const openSaveFileDialog = di.inject(openSaveFileDialogInjectable);
    const logger = di.inject(loggerInjectable);

    return async (params: ResourceDescriptor, query: PodLogsQuery) => {
      const logs = await callForLogs(params, query).catch(error => {
        logger.error("Can't download logs: ", error);
      });

      if (logs) {
        openSaveFileDialog(`${params.name}.log`, logs, "text/plain");
      }
    };
  },
});

export default downloadAllLogsInjectable;
