import { ipcRenderer } from "electron";
import { createBrowserHistory, createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import logger from "../../main/logger";

export const history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();
export const navigation = createObservableHistory(history);

navigation.listen((location, action) => {
  const isClusterView = !process.isMainFrame;
  const domain = global.location.href;

  logger.debug(`[NAVIGATION]: ${action}`, { isClusterView, domain, location });
});
