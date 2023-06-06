/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { prometheusDetailsChannel } from "../../../common/k8s-api/endpoints/metrics.api/prometheus-details.channel";
import prometheusHandlerInjectable from "./prometheus-handler.injectable";
import clustersInjectable from "../../../features/cluster/storage/common/clusters.injectable";

const prometheusDetailsChannelListener =
  getRequestChannelListenerInjectable({
    id: "add-helm-repository-channel-listener",
    channel: prometheusDetailsChannel,
    getHandler: (di) => {
      return async (clusterId) => {
        const clusters = di.inject(clustersInjectable);
        const cluster = clusters.get().find((c) => c.id === clusterId);

        if (!cluster) {
          throw new Error(`Cluster with id "${clusterId}" not found`);
        }
        const prometheusHandler = di.inject(prometheusHandlerInjectable, cluster);
        const details = await prometheusHandler.getPrometheusDetails();

        return {
          prometheusPath: details.prometheusPath,
          provider: {
            kind: details.provider.kind,
            name: details.provider.name,
            isConfigurable: details.provider.isConfigurable,
          },
        };
      };
    },
  });

export default prometheusDetailsChannelListener;
