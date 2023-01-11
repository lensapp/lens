/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { CustomResources } from "./crd-resources";
import customResourcesRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resources/custom-resources-route.injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";

const customResourcesRouteComponentInjectable = getInjectable({
  id: "custom-resources-route-component",

  instantiate: (di) => ({
    route: di.inject(customResourcesRouteInjectable),
    Component: CustomResources,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default customResourcesRouteComponentInjectable;
