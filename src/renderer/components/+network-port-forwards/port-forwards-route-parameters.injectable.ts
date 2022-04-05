/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";

const portForwardsRouteParametersInjectable = getInjectable({
  id: "port-forwards-route-parameters",

  instantiate: (di) => {
    const route = di.inject(portForwardsRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);

    return {
      forwardport: computed(() => pathParameters.get().forwardport),
    };
  },
});

export default portForwardsRouteParametersInjectable;
