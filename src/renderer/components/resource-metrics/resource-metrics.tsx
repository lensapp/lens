/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-metrics.scss";

import React, { createContext, useEffect, useState } from "react";
import { Radio, RadioGroup } from "../radio";
import { useInterval } from "../../hooks";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { cssNames, noop } from "../../utils";
import { Spinner } from "../spinner";
import type { MetricsTab } from "../chart/options";
import type { MetricData } from "../../../common/k8s-api/endpoints/metrics.api";

export type AtLeastOneMetricTab = [MetricsTab, ...MetricsTab[]];

export interface ResourceMetricsProps extends React.HTMLProps<any> {
  tabs: AtLeastOneMetricTab;
  object: KubeObject;
  loader?: () => void;
  interval?: number;
  className?: string;
  metrics: Partial<Record<string, MetricData>> | null | undefined;
}

export interface ResourceMetricsValue {
  object: KubeObject;
  tab: MetricsTab;
  metrics: Partial<Record<string, MetricData>> | null | undefined;
}

export const ResourceMetricsContext = createContext<ResourceMetricsValue | null>(null);

export function ResourceMetrics({ object, loader = noop, interval = 60, tabs, children, className, metrics }: ResourceMetricsProps) {
  const [tab, setTab] = useState<MetricsTab>(tabs[0]);

  useEffect(loader, [object]);
  useInterval(loader, interval * 1000);

  const renderContents = () => {
    return (
      <>
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
                value={tab}
              />
            ))}
          </RadioGroup>
        </div>
        <ResourceMetricsContext.Provider value={{ object, tab, metrics }}>
          <div className="graph">
            {children}
          </div>
        </ResourceMetricsContext.Provider>
        <div className="loader">
          <Spinner/>
        </div>
      </>
    );
  };

  return (
    <div className={cssNames("ResourceMetrics flex column", className)}>
      {renderContents()}
    </div>
  );
}
