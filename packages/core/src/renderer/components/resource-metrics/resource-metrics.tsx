/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-metrics.scss";

import React, { createContext, useState } from "react";
import { Radio, RadioGroup } from "../radio";
import type { KubeObject } from "@k8slens/kube-object";
import { cssNames } from "@k8slens/utilities";
import { Spinner } from "../spinner";
import type { MetricsTab } from "../chart/options";
import type { MetricData } from "../../../common/k8s-api/endpoints/metrics.api";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { isComputed } from "mobx";
import { observer } from "mobx-react-lite";

export type AtLeastOneMetricTab = [MetricsTab, ...MetricsTab[]];

export interface ResourceMetricsProps<Keys extends string> {
  tabs: AtLeastOneMetricTab;
  object: KubeObject;
  className?: string;
  metrics: IAsyncComputed<Partial<Record<Keys, MetricData>> | null | undefined> | Partial<Record<Keys, MetricData>>;
  children: React.ReactChild | React.ReactChild[];
}

function isAsyncComputedMetrics<Keys extends string>(metrics: IAsyncComputed<Partial<Record<Keys, MetricData>> | null | undefined> | Partial<Record<Keys, MetricData>>): metrics is IAsyncComputed<Partial<Record<Keys, MetricData>> | null | undefined> {
  return isComputed((metrics as IAsyncComputed<unknown>).value);
}

export interface ResourceMetricsValue {
  object: KubeObject;
  tab: MetricsTab;
  metrics: Partial<Record<string, MetricData>> | null | undefined;
}

export const ResourceMetricsContext = createContext<ResourceMetricsValue | null>(null);

export const ResourceMetrics = observer(<Keys extends string>({
  object,
  tabs,
  children,
  className,
  metrics,
}: ResourceMetricsProps<Keys>) => {
  const [tab, setTab] = useState<MetricsTab>(tabs[0]);

  return (
    <div className={cssNames("ResourceMetrics flex column", className)}>
      <div className="switchers">
        <RadioGroup
          asButtons
          className="flex box grow gaps"
          value={tab}
          onChange={setTab}
        >
          {tabs.map((tab, index) => (
            <Radio
              key={index}
              className="box grow"
              label={tab}
              value={tab} />
          ))}
        </RadioGroup>
      </div>
      <ResourceMetricsContext.Provider
        value={{
          object,
          tab,
          metrics: isAsyncComputedMetrics(metrics)
            ? metrics.value.get()
            : metrics,
        }}
      >
        <div className="graph">
          {children}
        </div>
      </ResourceMetricsContext.Provider>
      <div className="loader">
        <Spinner />
      </div>
    </div>
  );
});
