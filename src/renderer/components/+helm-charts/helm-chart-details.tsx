/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./helm-chart-details.scss";

import React, { Component } from "react";
import type { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { autoBind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select } from "../select";
import { Badge } from "../badge";
import { Tooltip, withStyles } from "@material-ui/core";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import createInstallChartTabInjectable from "../dock/install-chart/create-install-chart-tab.injectable";
import { HelmChartIcon } from "./icon";
import readmeOfSelectHelmChartInjectable from "./details/readme-of-selected-helm-chart.injectable";
import versionsOfSelectedHelmChartInjectable from "./details/versions-of-selected-helm-chart.injectable";
import type { HelmChartDetailsVersionSelection } from "./details/versions/helm-chart-details-version-selection.injectable";
import helmChartDetailsVersionSelectionInjectable from "./details/versions/helm-chart-details-version-selection.injectable";
import assert from "assert";

export interface HelmChartDetailsProps {
  hideDetails(): void;
  chart: HelmChart;
}

const LargeTooltip = withStyles({
  tooltip: {
    fontSize: "var(--font-size-small)",
  },
})(Tooltip);

interface Dependencies {
  createInstallChartTab: (helmChart: HelmChart) => void;
  versions: IAsyncComputed<HelmChart[]>;
  readme: IAsyncComputed<string>;
  versionSelection: HelmChartDetailsVersionSelection;
}

@observer
class NonInjectedHelmChartDetails extends Component<HelmChartDetailsProps & Dependencies> {
  constructor(props: HelmChartDetailsProps & Dependencies) {
    super(props);
    autoBind(this);
  }

  get chart() {
    return this.props.chart;
  }

  install() {
    const chart = this.props.versionSelection.value.get();

    assert(chart);

    this.props.createInstallChartTab(chart);
    this.props.hideDetails();
  }

  renderIntroduction(selectedChart: HelmChart) {
    const testId = selectedChart.getFullName("-");

    return (
      <div className="introduction flex align-flex-start">
        <HelmChartIcon
          chart={selectedChart}
          className="intro-logo"
        />
        <div className="intro-contents box grow">
          <div className="description flex align-center justify-space-between" data-testid="selected-chart-description">
            {selectedChart.getDescription()}
            <Button
              primary
              label="Install"
              onClick={this.install}
              data-testid={`install-chart-for-${testId}`}
            />
          </div>
          <DrawerItem
            name="Version"
            className="version"
            onClick={stopPropagation}
          >
            <Select
              id={`helm-chart-version-selector-${testId}`}
              themeName="outlined"
              menuPortalTarget={null}
              options={this.props.versionSelection.options.get()}
              formatOptionLabel={({ value: chart }) => (
                chart.deprecated
                  ? (
                    <LargeTooltip title="Deprecated" placement="left">
                      <span className="deprecated">{chart.version}</span>
                    </LargeTooltip>
                  )
                  : chart.version
              )}
              isOptionDisabled={({ value: chart }) => chart.deprecated}
              value={this.props.versionSelection.value.get()}
              onChange={this.props.versionSelection.onChange}
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
    return (
      <div className="chart-description" data-testid="helmchart-readme">
        <MarkdownViewer markdown={this.props.readme.value.get()} />
      </div>
    );
  }

  renderContent() {
    const readmeIsLoading = this.props.readme.pending.get();
    const versionsAreLoading = this.props.versions.pending.get();

    if (!this.chart || versionsAreLoading) {
      return <Spinner center data-testid="spinner-for-chart-details" />;
    }

    return (
      <div className="box grow">
        {this.renderIntroduction(this.chart)}

        {readmeIsLoading ? (
          <Spinner center data-testid="spinner-for-chart-readme" />
        ) : (
          this.renderReadme()
        )}
      </div>
    );
  }

  render() {
    return (
      <Drawer
        className="HelmChartDetails"
        usePortal={true}
        open={!!this.chart}
        title={this.chart ? `Chart: ${this.chart.getFullName()}` : ""}
        onClose={this.props.hideDetails}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}

export const HelmChartDetails = withInjectables<Dependencies, HelmChartDetailsProps>(NonInjectedHelmChartDetails, {
  getProps: (di, props) => ({
    ...props,
    createInstallChartTab: di.inject(createInstallChartTabInjectable),
    readme: di.inject(readmeOfSelectHelmChartInjectable, props.chart),
    versions: di.inject(versionsOfSelectedHelmChartInjectable, props.chart),
    versionSelection: di.inject(helmChartDetailsVersionSelectionInjectable, props.chart),
  }),
});
