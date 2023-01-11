/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import crdListRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/crd-list/crd-list-route.injectable";
import { CustomResourceDefinitions } from "./crd-list";

const crdListRouteComponentInjectable = getInjectable({
  id: "crd-list-route-component",

  instantiate: (di) => ({
    route: di.inject(crdListRouteInjectable),
    Component: CustomResourceDefinitions,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default crdListRouteComponentInjectable;
