/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ipcRenderer } from "electron";
import { createBrowserHistory, createMemoryHistory } from "history";
import { createObservableHistory, ObservableSearchParamsOptions } from "mobx-observable-history";
import logger from "../../common/logger";

export const searchParamsOptions: ObservableSearchParamsOptions = {
  skipEmpty: true, // skip empty params, e.g. "?x=&y2=" will be "?y=2"
  joinArrays: false, // join multiple params with same name, e.g. "?x=1&x=2" => "?x=1,2"
  joinArraysWith: ",", // param values splitter, applicable only with {joinArrays:true}
};

export const history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();

export const navigation = createObservableHistory(history, {
  searchParams: searchParamsOptions,
});

navigation.listen((location, action) => {
  const isClusterView = !process.isMainFrame;
  const domain = global.location.href;

  logger.debug(`[NAVIGATION]: ${action}-ing. Current is now:`, { isClusterView, domain, location });
});
