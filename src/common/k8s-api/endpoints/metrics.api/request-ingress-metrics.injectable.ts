/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MetricData } from "../metrics.api";
import requestMetricsInjectable from "./request-metrics.injectable";

export interface IngressMetricData {
  bytesSentSuccess: MetricData;
  bytesSentFailure: MetricData;
  requestDurationSeconds: MetricData;
  responseDurationSeconds: MetricData;
}

export type RequestIngressMetrics = (ingress: string, namespace: string) => Promise<IngressMetricData>;

const requestIngressMetricsInjectable = getInjectable({
  id: "request-ingress-metrics",
  instantiate: (di): RequestIngressMetrics => {
    const requestMetrics = di.inject(requestMetricsInjectable);

    return (ingress, namespace) => {
      const opts = { category: "ingress", ingress, namespace };

      return requestMetrics({
        bytesSentSuccess: opts,
        bytesSentFailure: opts,
        requestDurationSeconds: opts,
        responseDurationSeconds: opts,
      }, {
        namespace,
      });
    };
  },
});

export default requestIngressMetricsInjectable;
