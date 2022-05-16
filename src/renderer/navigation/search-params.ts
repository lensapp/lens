/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ObservableSearchParamsOptions } from "mobx-observable-history";

export const searchParamsOptions: ObservableSearchParamsOptions = {
  skipEmpty: true, // skip empty params, e.g. "?x=&y2=" will be "?y=2"
  joinArrays: false, // join multiple params with same name, e.g. "?x=1&x=2" => "?x=1,2"
  joinArraysWith: ",", // param values splitter, applicable only with {joinArrays:true}
};
