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
import type { IMetrics } from "../../../common/k8s-api/endpoints/metrics.api";

export interface ResourceMetricsProps {
  tabs: React.ReactNode[];
  object?: KubeObject;
  loader?: () => void;
  /**
   * The time (in seconds) between each call to `loader`
   *
   * @default 60
   */
  interval?: number;
  className?: string;
  children?: React.ReactChildren | React.ReactChild;
  metrics: Record<string, IMetrics | undefined> | null;
}

export interface IResourceMetricsValue {
  object?: KubeObject;
  tabId: number;
  metrics: Record<string, IMetrics | undefined> | null;
}

export const ResourceMetricsContext = createContext<IResourceMetricsValue>(null);

export function ResourceMetrics({ object, loader = noop, interval = 60, tabs, children, metrics, className }: ResourceMetricsProps) {
  const [tabId, setTabId] = useState(0);

  useEffect(() => {
    loader();
  }, [object]);

  useInterval(() => {
    loader();
  }, interval * 1000);

  const renderContents = () => {
    return (
      <>
        <div className="switchers">
          <RadioGroup
            asButtons
            className="flex box grow gaps"
            value={tabs[tabId]}
            onChange={value => setTabId(tabs.findIndex(tab => tab == value))}
          >
            {tabs.map((tab, index) => (
              <Radio key={index} className="box grow" label={tab} value={tab}/>
            ))}
          </RadioGroup>
        </div>
        <ResourceMetricsContext.Provider value={{ object, tabId, metrics }}>
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
