/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { EntitySettingsRouteComponent } from "./entity-settings";
import { routeSpecificComponentInjectionToken } from "../../routes/route-specific-component-injection-token";
import entitySettingsRouteInjectable from "../../../common/front-end-routing/routes/entity-settings/entity-settings-route.injectable";

const entitySettingsRouteComponentInjectable = getInjectable({
  id: "entity-settings-route-component",

  instantiate: (di) => ({
    route: di.inject(entitySettingsRouteInjectable),
    Component: EntitySettingsRouteComponent,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default entitySettingsRouteComponentInjectable;
