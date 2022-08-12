import { getInjectable } from "@ogre-tools/injectable";
import type { PodLogsQuery } from "../../../../common/k8s-api/endpoints";
import type { ResourceDescriptor } from "../../../../common/k8s-api/kube-api";
import openSaveFileDialogInjectable from "../../../utils/save-file.injectable";
import callForLogsInjectable from "./call-for-logs.injectable";

const downloadAllLogsInjectable = getInjectable({
  id: "download-all-logs",

  instantiate: (di) => {
    const callForLogs = di.inject(callForLogsInjectable);
    const openSaveFileDialog = di.inject(openSaveFileDialogInjectable)

    return async (params: ResourceDescriptor, query: PodLogsQuery) => {
      const logs = await callForLogs(params, query)
      
      openSaveFileDialog(`${params.name}.log`, logs, "text/plain");
    }
  },
});

export default downloadAllLogsInjectable;