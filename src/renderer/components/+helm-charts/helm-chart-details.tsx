/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./helm-chart-details.scss";

import React, { Component } from "react";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { getChartDetails } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { observable, reaction, runInAction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { autoBind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select } from "../select";
import { Badge } from "../badge";
import { Tooltip, withStyles } from "@material-ui/core";
import { withInjectables } from "@ogre-tools/injectable-react";
import createInstallChartTabInjectable from "../dock/install-chart/create-install-chart-tab.injectable";
import { Notifications } from "../notifications";

export interface HelmChartDetailsProps {
  chart: HelmChart;
  hideDetails(): void;
}

const LargeTooltip = withStyles({
  tooltip: {
    fontSize: "var(--font-size-small)",
  },
})(Tooltip);

interface Dependencies {
  createInstallChartTab: (helmChart: HelmChart) => void;
}

@observer
class NonInjectedHelmChartDetails extends Component<HelmChartDetailsProps & Dependencies> {
  readonly chartVersions = observable.array<HelmChart>();
  readonly selectedChart = observable.box<HelmChart | undefined>();
  readonly readme = observable.box<string | undefined>(undefined);

  private abortController = new AbortController();

  constructor(props: HelmChartDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  componentWillUnmount() {
    this.abortController.abort();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.chart, async ({ name, repo, version }) => {
        runInAction(() => {
          this.selectedChart.set(undefined);
          this.chartVersions.clear();
          this.readme.set("");
        });

        try {
          const { readme, versions } = await getChartDetails(repo, name, { version });

          runInAction(() => {
            this.readme.set(readme);
            this.chartVersions.replace(versions);
            this.selectedChart.set(versions[0]);
          });
        } catch (error) {
          Notifications.checkedError(error, "Unknown error occured while getting chart details");
        }
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  async onVersionChange(c: HelmChart | null | undefined) {
    const chart = c ?? this.chartVersions[0];

    runInAction(() => {
      this.selectedChart.set(chart ?? undefined);
      this.readme.set(undefined);
    });

    try {
      this.abortController.abort();
      this.abortController = new AbortController();
      const { chart: { name, repo }} = this.props;
      const { readme } = await getChartDetails(repo, name, { version: chart.version, reqInit: { signal: this.abortController.signal }});

      this.readme.set(readme);
    } catch (error) {
      Notifications.checkedError(error, "Unknown error occured while getting chart details");
    }
  }

  install(selectedChart: HelmChart) {
    this.props.createInstallChartTab(selectedChart);
    this.props.hideDetails();
  }

  renderIntroduction(selectedChart: HelmChart) {
    const { chartVersions, onVersionChange } = this;
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
            <Button
              primary
              label="Install"
              onClick={() => this.install(selectedChart)}
            />
          </div>
          <DrawerItem
            name="Version"
            className="version"
            onClick={stopPropagation}
          >
            <Select
              id="chart-version-input"
              themeName="outlined"
              menuPortalTarget={null}
              options={chartVersions.slice()}
              getOptionLabel={chart => chart.version}
              formatOptionLabel={chart => (
                chart.deprecated
                  ? (
                    <LargeTooltip title="Deprecated" placement="left">
                      <span className="deprecated">{chart.version}</span>
                    </LargeTooltip>
                  )
                  : chart.version
              )}
              isOptionDisabled={chart => chart.deprecated}
              value={selectedChart}
              onChange={onVersionChange}
            />
          </DrawerItem>
          <DrawerItem name="Home">
            <a
              href={selectedChart.getHome()}
              target="_blank"
              rel="noreferrer"
            >
              {selectedChart.getHome()}
            </a>
          </DrawerItem>
          <DrawerItem name="Maintainers" className="maintainers">
            {selectedChart.getMaintainers().map(({ name, email, url }) => (
              <a
                key={name}
                href={url || `mailto:${email}`}
                target="_blank"
                rel="noreferrer"
              >
                {name}
              </a>
            ))}
          </DrawerItem>
          {selectedChart.getKeywords().length > 0 && (
            <DrawerItem name="Keywords" labelsOnly>
              {selectedChart.getKeywords().map(key => <Badge key={key} label={key} />)}
            </DrawerItem>
          )}
        </div>
      </div>
    );
  }

  renderReadme() {
    const readme = this.readme.get();

    if (readme === undefined) {
      return <Spinner center />;
    }

    return (
      <div className="chart-description">
        <MarkdownViewer markdown={readme} />
      </div>
    );
  }

  renderContent() {
    const selectedChart = this.selectedChart.get();

    if (!selectedChart) {
      return <Spinner center />;
    }

    return (
      <div className="box grow">
        {this.renderIntroduction(selectedChart)}
        {this.renderReadme()}
      </div>
    );
  }

  render() {
    const { chart, hideDetails } = this.props;

    return (
      <Drawer
        className="HelmChartDetails"
        usePortal={true}
        open={!!chart}
        title={chart ? `Chart: ${chart.getFullName()}` : ""}
        onClose={hideDetails}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}

export const HelmChartDetails = withInjectables<Dependencies, HelmChartDetailsProps>(
  NonInjectedHelmChartDetails,

  {
    getProps: (di, props) => ({
      createInstallChartTab: di.inject(createInstallChartTabInjectable),
      ...props,
    }),
  },
);
