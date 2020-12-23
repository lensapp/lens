import { ipcRenderer } from "electron";
import { createBrowserHistory, createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";

export const history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();
export const navigation = createObservableHistory(history);
