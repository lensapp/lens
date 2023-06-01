/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { prometheusDetailsChannel } from "../../../common/k8s-api/endpoints/metrics.api/prometheus-details.channel";
import type { Cluster } from "../../../common/cluster/cluster";


const getPrometheusDetailsRouteInjectable = getInjectable({
  id: "get-prometheus-details-route",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return (async (cluster: Cluster) => {
      const prometheusDetails = await requestFromChannel(prometheusDetailsChannel, cluster);

      return prometheusDetails;
    });
  },
});

export default getPrometheusDetailsRouteInjectable;
