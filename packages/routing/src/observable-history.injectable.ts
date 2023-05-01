/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import {
  createObservableHistory,
  ObservableHistory,
} from "mobx-observable-history";
import { searchParamsOptions } from "./search-params";
import { historyInjectable } from "./history.injectable";

export const observableHistoryInjectionToken = getInjectionToken<
  ObservableHistory<unknown>
>({
  id: "observable-history-injection-token",
});

export const observableHistoryInjectable = getInjectable({
  id: "observable-history",

  instantiate: (di) => {
    const history = di.inject(historyInjectable);
    const navigation = createObservableHistory(history, {
      searchParams: searchParamsOptions,
    });

    return navigation;
  },
  injectionToken: observableHistoryInjectionToken,
});
