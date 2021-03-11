import { ipcRenderer } from "electron";
import { createBrowserHistory, createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import { getHostedClusterId } from "../../common/cluster-store";
import logger from "../../main/logger";

export const history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();
export const navigation = createObservableHistory(history);

navigation.listen((location, action) => {
  const clusterId = getHostedClusterId();
  const frame = clusterId ?? "root";

  logger.debug(`[NAVIGATION]: ${action}`, { location, frame });
});
