/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { getChartDetails, HelmChart } from "../../../common/k8s-api/endpoints/helm-chart.api";
import { observable, reaction } from "mobx";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { disposer, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";
import { Tooltip, withStyles } from "@material-ui/core";
import { withInjectables } from "@ogre-tools/injectable-react";
import newInstallChartTabInjectable from "../dock/install-chart/create-tab.injectable";

export interface HelmChartDetailsProps {
  chart: HelmChart | null | undefined;
  hideDetails(): void;
}

const LargeTooltip = withStyles({
  tooltip: {
    fontSize: "var(--font-size-small)",
  },
})(Tooltip);

interface Dependencies {
  newInstallChartTab: (chart: HelmChart) => void;
}

const NonInjectedHelmChartDetails = observer(({ newInstallChartTab, chart, hideDetails }: Dependencies & HelmChartDetailsProps) => {
  const [chartVersions] = useState(observable.array<HelmChart>());
  const [selectedChart, setSelectedChart] = useState<HelmChart | undefined>(undefined);
  const [readme, setReadme] = useState("");
  const [error, setError] = useState("");
  const [ac, setAc] = useState(new AbortController());

  useEffect(() => disposer(
    () => ac.abort(),
    reaction(() => chart, async ({ name, repo, version }) => {
      try {
        setError("");
        setSelectedChart(undefined);
        chartVersions.clear();
        setReadme("");

        const { readme, versions } = await getChartDetails(repo, name, { version });

        setReadme(readme);
        chartVersions.replace(versions);
        setSelectedChart(versions[0]);
      } catch (error) {
        setError(String(error));
        setSelectedChart(undefined);
      }
    }, {
      fireImmediately: true,
    }),
  ), []);

  const onVersionChange = async ({ value: chart }: SelectOption<HelmChart>) => {
    setSelectedChart(chart);
    setReadme(readme);

    try {
      ac.abort();
      setAc(new AbortController());
      const { name, repo } = chart;
      const { readme } = await getChartDetails(repo, name, { version: chart.version, reqInit: { signal: ac.signal }});

      setReadme(readme);
    } catch (error) {
      setError(String(error));
    }
  };
  const install = ()  => {
    newInstallChartTab(selectedChart);
    hideDetails();
  };
  const renderIntroduction = () => {
    const placeholder = require("./helm-placeholder.svg");

    return (
      <div className="introduction flex align-flex-start">
        <img
          className="intro-logo"
          src={selectedChart.getIcon() || placeholder}
          onError={(event) => event.currentTarget.src = placeholder}
        />
        <div className="intro-contents box grow">
          <div className="description flex align-center justify-space-between">
            {selectedChart.getDescription()}
            <Button primary label="Install" onClick={install} />
          </div>
          <DrawerItem name="Version" className="version" onClick={stopPropagation}>
            <Select
              themeName="outlined"
              menuPortalTarget={null}
              options={chartVersions.map(chart => ({
                label: (
                  chart.deprecated
                    ? (
                      <LargeTooltip title="Deprecated" placement="left">
                        <span className="deprecated">{chart.version}</span>
                      </LargeTooltip>
                    )
                    : chart.version
                ),
                value: chart,
              }))}
              isOptionDisabled={({ value: chart }) => chart.deprecated}
              value={selectedChart}
              onChange={onVersionChange}
            />
          </DrawerItem>
          <DrawerItem name="Home">
            <a href={selectedChart.getHome()} target="_blank" rel="noreferrer">{selectedChart.getHome()}</a>
          </DrawerItem>
          <DrawerItem name="Maintainers" className="maintainers">
            {selectedChart.getMaintainers().map(({ name, email, url }) =>
              <a key={name} href={url || `mailto:${email}`} target="_blank" rel="noreferrer">{name}</a>,
            )}
          </DrawerItem>
          {selectedChart.getKeywords().length > 0 && (
            <DrawerItem name="Keywords" labelsOnly>
              {selectedChart.getKeywords().map(key => <Badge key={key} label={key} />)}
            </DrawerItem>
          )}
        </div>
      </div>
    );
  };
  const renderReadme = () => {
    if (readme === null) {
      return <Spinner center />;
    }

    return (
      <div className="chart-description">
        <MarkdownViewer markdown={readme} />
      </div>
    );
  };
  const renderContent = () => {
    if (error) {
      return (
        <div className="box grow">
          <p className="error">{error}</p>
        </div>
      );
    }

    if (!selectedChart) {
      return <Spinner center />;
    }

    return (
      <div className="box grow">
        {renderIntroduction()}
        {renderReadme()}
      </div>
    );
  };

  if (!chart) {
    return null;
  }

  return (
    <Drawer
      className="HelmChartDetails"
      usePortal
      open
      title={`Chart: ${chart.getFullName()}`}
      onClose={hideDetails}
    >
      {renderContent()}
    </Drawer>
  );
});

export const HelmChartDetails = withInjectables<Dependencies, HelmChartDetailsProps>(NonInjectedHelmChartDetails, {
  getProps: (di, props) => ({
    newInstallChartTab: di.inject(newInstallChartTabInjectable),
    ...props,
  }),
});
