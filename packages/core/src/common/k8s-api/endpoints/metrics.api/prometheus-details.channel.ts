/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getRequestChannel } from "@k8slens/messaging";
import type { PrometheusDetails } from "../../../../main/cluster/prometheus-handler/prometheus-handler";
import type { ClusterId } from "../../../cluster-types";
import type { PrometheusProvider } from "../../../../main/prometheus/provider";

type PrometheusProviderData = Pick<PrometheusProvider, "kind" | "name" | "isConfigurable">;

export type PrometheusDetailsData = Pick<PrometheusDetails, "prometheusPath"> & {
  provider: PrometheusProviderData;
};

export const prometheusDetailsChannel = getRequestChannel<ClusterId, PrometheusDetailsData>("prometheus-details");
