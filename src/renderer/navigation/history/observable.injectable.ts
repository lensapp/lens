/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createObservableHistory } from "mobx-observable-history";
import loggerInjectable from "../../../common/logger.injectable";
import { searchParamsOptions } from "./search-params";
import historyInjectable from "./history.injectable";

const observableHistoryInjectable = getInjectable({
  id: "observable-history",
  instantiate: (di) => {
    const history = di.inject(historyInjectable);
    const logger = di.inject(loggerInjectable);
    const navigation =  createObservableHistory(history, {
      searchParams: searchParamsOptions,
    });

    navigation.listen((location, action) => {
      const isClusterView = !process.isMainFrame;
      const domain = global.location.href;

      logger.debug(`[NAVIGATION]: ${action}-ing. Current is now:`, { isClusterView, domain, location });
    });

    return navigation;
  },
});

export default observableHistoryInjectable;
