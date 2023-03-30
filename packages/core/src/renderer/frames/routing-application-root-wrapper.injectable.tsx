/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Router } from "react-router";
import historyInjectable from "../navigation/history.injectable";
import React from "react";
import {
  reactApplicationWrapperInjectionToken,
} from "@k8slens/react-application-root";

const routingApplicationRootWrapperInjectable = getInjectable({
  id: "routing-application-root-wrapper",

  instantiate: (di) => {
    const history = di.inject(historyInjectable);

    return (Component) => () =>
      (
        <Router history={history}>
          <Component />
        </Router>
      );
  },

  injectionToken: reactApplicationWrapperInjectionToken,
});

export default routingApplicationRootWrapperInjectable;
