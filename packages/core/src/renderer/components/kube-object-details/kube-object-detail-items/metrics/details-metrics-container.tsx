/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { KubeObjectDetailMetrics } from "@k8slens/metrics";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { KubeObject } from "../../../../../common/k8s-api/kube-object";

interface DetailsMetricsContainerProps<Kube extends KubeObject = KubeObject> {
  metrics: IComputedValue<KubeObjectDetailMetrics[]>;
  object?: Kube;
}

export const DetailsMetricsContainer = observer(({ metrics, object }: DetailsMetricsContainerProps) => (
  <>
    {metrics.get().map((metrics) => (
      <metrics.Component object={object} key={metrics.id} />
    ))}
  </>
));
