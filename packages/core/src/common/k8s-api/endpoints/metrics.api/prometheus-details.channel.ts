/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannel } from "@k8slens/messaging";
import type { PrometheusDetails } from "../../../../main/cluster/prometheus-handler/prometheus-handler";
import type { PrometheusProvider } from "../../../../main/prometheus/provider";
import type { Cluster } from "../../../cluster/cluster";

type PrometheusProviderData = Pick<PrometheusProvider, "kind" | "name" | "isConfigurable">;

export type PrometheusDetailsData = Pick<PrometheusDetails, "prometheusPath"> & {
  provider: PrometheusProviderData;
};

export const prometheusDetailsChannel = getRequestChannel<Cluster, PrometheusDetailsData>("prometheus-details");
