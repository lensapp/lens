import "./resource-metrics.scss";

import React, { createContext, useEffect, useState } from "react";
import { Radio, RadioGroup } from "../radio";
import { useInterval } from "../../hooks";
import { KubeObject } from "../../api/kube-object";
import { cssNames } from "../../utils";
import { Spinner } from "../spinner";

interface Props extends React.HTMLProps<any> {
  tabs: React.ReactNode[];
  object?: KubeObject;
  loader?: () => void;
  interval?: number;
  className?: string;
  params?: {
    [key: string]: any;
  };
}

export type IResourceMetricsValue<T extends KubeObject = any, P = any> = {
  object: T;
  tabId: number;
  params?: P;
}

export const ResourceMetricsContext = createContext<IResourceMetricsValue>(null);

const defaultProps: Partial<Props> = {
  interval: 60  // 1 min
};

ResourceMetrics.defaultProps = defaultProps;

export function ResourceMetrics({ object, loader, interval, tabs, children, className, params }: Props) {
  const [tabId, setTabId] = useState<number>(0);

  useEffect(() => {
    if (loader) loader();
  }, [object]);

  useInterval(() => {
    if (loader) loader();
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
        <ResourceMetricsContext.Provider value={{ object, tabId, params }}>
          <div className="graph">
            {children}
          </div>
        </ResourceMetricsContext.Provider>
        <div className="loader">
          <Spinner/>
        </div>
      </>
    );
  }

  return (
    <div className={cssNames("ResourceMetrics flex column", className)}>
      {renderContents()}
    </div>
  );
}
