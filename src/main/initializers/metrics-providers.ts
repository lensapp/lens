/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { PrometheusProviderRegistry } from "../prometheus";
import { PrometheusHelm } from "../prometheus/helm";
import { PrometheusLens } from "../prometheus/lens";
import { PrometheusOperator } from "../prometheus/operator";
import { PrometheusStacklight } from "../prometheus/stacklight";

export function initPrometheusProviderRegistry() {
  PrometheusProviderRegistry
    .getInstance()
    .registerProvider(new PrometheusLens())
    .registerProvider(new PrometheusHelm())
    .registerProvider(new PrometheusOperator())
    .registerProvider(new PrometheusStacklight());
}
