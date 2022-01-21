/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRenderer } from "electron";
import { createBrowserHistory, createMemoryHistory } from "history";
import { createObservableHistory, ObservableSearchParamsOptions } from "mobx-observable-history";
import logger from "../../main/logger";

export const searchParamsOptions: ObservableSearchParamsOptions = {
  skipEmpty: true, // skip empty params, e.g. "?x=&y2=" will be "?y=2"
  joinArrays: false, // join multiple params with same name, e.g. "?x=1&x=2" => "?x=1,2"
  joinArraysWith: ",", // param values splitter, applicable only with {joinArrays:true}
};

/**
 * @deprecated: Switch to using di.inject(historyInjectable)
 */
export const history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();

/**
 * @deprecated: Switch to using di.inject(observableHistoryInjectable)
 */
export const navigation = createObservableHistory(history, {
  searchParams: searchParamsOptions,
});

navigation.listen((location, action) => {
  const isClusterView = !process.isMainFrame;
  const domain = global.location.href;

  logger.debug(`[NAVIGATION]: ${action}-ing. Current is now:`, { isClusterView, domain, location });
});
