/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { EntitySettingsRouteComponent } from "./entity-settings";
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import entitySettingsRouteInjectable from "../../../common/front-end-routing/routes/entity-settings/entity-settings-route.injectable";

const entitySettingsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "entity-settings-route-component",
  Component: EntitySettingsRouteComponent,
  routeInjectable: entitySettingsRouteInjectable,
});

export default entitySettingsRouteComponentInjectable;
