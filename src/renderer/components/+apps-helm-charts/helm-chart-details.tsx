/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./helm-chart-details.scss";

import React, { Component } from "react";
import { getChartDetails, HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { observable, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { boundMethod, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { Badge } from "../badge";
import { Tooltip, withStyles } from "@material-ui/core";
import { withInjectables } from "@ogre-tools/injectable-react";
import createInstallChartTabInjectable from "../dock/create-install-chart-tab/create-install-chart-tab.injectable";

interface Props {
  chart: HelmChart;
  hideDetails(): void;
}

const LargeTooltip = withStyles({
  tooltip: {
    fontSize: "var(--font-size-small)",
  },
})(Tooltip);

interface Dependencies {
  createInstallChartTab: (helmChart: HelmChart) => void
}

@observer
class NonInjectedHelmChartDetails extends Component<Props & Dependencies> {
  @observable chartVersions: HelmChart[];
  @observable selectedChart?: HelmChart;
  @observable readme?: string;
  @observable error?: string;

  private abortController?: AbortController;

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentWillUnmount() {
    this.abortController?.abort();
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.chart, async ({ name, repo, version }) => {
        try {
          this.selectedChart = undefined;
          this.chartVersions = undefined;
          this.readme = undefined;

          const { readme, versions } = await getChartDetails(repo, name, { version });

          this.readme = readme;
          this.chartVersions = versions;
          this.selectedChart = versions[0];
        } catch (error) {
          this.error = error;
          this.selectedChart = null;
        }
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  @boundMethod
  async onVersionChange({ value: chart }: SelectOption<HelmChart>) {
    this.selectedChart = chart;
    this.readme = null;

    try {
      this.abortController?.abort();
      this.abortController = new AbortController();
      const { chart: { name, repo }} = this.props;
      const { readme } = await getChartDetails(repo, name, { version: chart.version, reqInit: { signal: this.abortController.signal }});

      this.readme = readme;
    } catch (error) {
      this.error = error;
    }
  }

  @boundMethod
  install() {
    this.props.createInstallChartTab(this.selectedChart);
    this.props.hideDetails();
  }

  renderIntroduction() {
    const { selectedChart, chartVersions, onVersionChange } = this;
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
            <Button primary label="Install" onClick={this.install} />
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
  }

  renderReadme() {
    if (this.readme === null) {
      return <Spinner center />;
    }

    return (
      <div className="chart-description">
        <MarkdownViewer markdown={this.readme} />
      </div>
    );
  }

  renderContent() {
    if (this.error) {
      return (
        <div className="box grow">
          <p className="error">{this.error}</p>
        </div>
      );
    }

    if (!this.selectedChart) {
      return <Spinner center />;
    }

    return (
      <div className="box grow">
        {this.renderIntroduction()}
        {this.renderReadme()}
      </div>
    );
  }

  render() {
    const { chart, hideDetails } = this.props;
    const title = chart ? `Chart: ${chart.getFullName()}` : "";

    return (
      <Drawer
        className="HelmChartDetails"
        usePortal={true}
        open={!!chart}
        title={title}
        onClose={hideDetails}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}

export const HelmChartDetails = withInjectables<Dependencies, Props>(
  NonInjectedHelmChartDetails,

  {
    getProps: (di, props) => ({
      createInstallChartTab: di.inject(createInstallChartTabInjectable),
      ...props,
    }),
  },
);
