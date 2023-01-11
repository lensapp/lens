/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createObservableHistory } from "mobx-observable-history";
import { searchParamsOptions } from "./search-params";
import historyInjectable from "./history.injectable";

const observableHistoryInjectable = getInjectable({
  id: "observable-history",

  instantiate: (di) => {
    const history = di.inject(historyInjectable);
    const navigation =  createObservableHistory(history, {
      searchParams: searchParamsOptions,
    });

    return navigation;
  },
});

export default observableHistoryInjectable;
