/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { logInfoInjectionToken } from "@k8slens/logger";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { prometheusDetailsChannel } from "../../../common/k8s-api/endpoints/metrics.api/prometheus-details.channel";


const getPrometheusDetailsRouteInjectable = getInjectable({
  id: "get-prometheus-details-route",

  instantiate: (di) => {
    const logger = di.inject(logInfoInjectionToken);
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return (async (clusterId: string) => {
      logger("requestFromChannel");
      const prometheusDetails = await requestFromChannel(prometheusDetailsChannel, clusterId);

      return prometheusDetails;
    });
  },
});

export default getPrometheusDetailsRouteInjectable;
