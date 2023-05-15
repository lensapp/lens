/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import customResourceDefinitionsRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resource-definitions.injectable";
import { CustomResourceDefinitions } from "./view";

const customResourceDefinitionsRouteComponentInjectable = getInjectable({
  id: "custom-resource-definitions-route-component",

  instantiate: (di) => ({
    route: di.inject(customResourceDefinitionsRouteInjectable),
    Component: CustomResourceDefinitions,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default customResourceDefinitionsRouteComponentInjectable;
