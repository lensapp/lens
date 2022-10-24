/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-metrics.scss";

import React, { createContext, useState } from "react";
import { Radio, RadioGroup } from "../radio";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { cssNames } from "../../utils";
import { Spinner } from "../spinner";
import type { MetricsTab } from "../chart/options";
import type { MetricData } from "../../../common/k8s-api/endpoints/metrics.api";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";

export type AtLeastOneMetricTab = [MetricsTab, ...MetricsTab[]];

export interface ResourceMetricsProps<Keys extends string> {
  tabs: AtLeastOneMetricTab;
  object: KubeObject;
  className?: string;
  metrics: IAsyncComputed<Partial<Record<Keys, MetricData>> | null | undefined>;
  children: React.ReactChild | React.ReactChild[];
}

export interface ResourceMetricsValue {
  object: KubeObject;
  tab: MetricsTab;
  metrics: Partial<Record<string, MetricData>> | null | undefined;
}

export const ResourceMetricsContext = createContext<ResourceMetricsValue | null>(null);

export function ResourceMetrics<Keys extends string>({ object, tabs, children, className, metrics }: ResourceMetricsProps<Keys>) {
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
          metrics: metrics.value.get(),
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
}
