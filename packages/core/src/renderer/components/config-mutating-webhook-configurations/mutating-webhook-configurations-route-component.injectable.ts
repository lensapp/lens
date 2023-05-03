/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import mutatingWebhookConfigurationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/mutating-webhook-configurations/mutating-webhook-configurations-route.injectable";
import { MutatingWebhookConfigurations } from "./mutating-webhook-configurations";

const mutatingWebhookConfigurationsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "mutating-webhook-configuration-route-component",
  Component: MutatingWebhookConfigurations,
  routeInjectable: mutatingWebhookConfigurationsRouteInjectable,
});

export default mutatingWebhookConfigurationsRouteComponentInjectable;
