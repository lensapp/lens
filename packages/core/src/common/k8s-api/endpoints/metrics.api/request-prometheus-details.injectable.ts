/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../../api-base.injectable";
import type { PrometheusDetails } from "../../../../main/cluster/prometheus-handler/prometheus-handler";

export type RequestPrometheusDetails = () => Promise<PrometheusDetails>;

const requestPrometheusDetailsInjectable = getInjectable({
  id: "request-prometheus-details",
  instantiate: (di): RequestPrometheusDetails => {
    const apiBase = di.inject(apiBaseInjectable);

    return () => apiBase.get("/prometheus/details");
  },
});

export default requestPrometheusDetailsInjectable;
