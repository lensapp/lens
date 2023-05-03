/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../routes/route-specific-component-injection-token";
import validatingWebhookConfigurationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/validating-webhook-configurations/validating-webhook-configurations-route.injectable";
import { ValidatingWebhookConfigurations } from "./validating-webhook-configurations";

const validatingWebhookConfigurationsRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "validating-webhook-configuration-route-component",
  Component: ValidatingWebhookConfigurations,
  routeInjectable: validatingWebhookConfigurationsRouteInjectable,
});

export default validatingWebhookConfigurationsRouteComponentInjectable;
