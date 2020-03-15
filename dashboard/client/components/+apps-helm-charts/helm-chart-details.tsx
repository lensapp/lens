import "./helm-chart-details.scss";

import React, { Component } from "react";
import { HelmChart, helmChartsApi } from "../../api/endpoints/helm-charts.api";
import { t, Trans } from "@lingui/macro";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { autobind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { CancelablePromise } from "../../utils/cancelableFetch";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { createInstallChartTab } from "../dock/install-chart.store";
import { Badge } from "../badge";
import { _i18n } from "../../i18n";

interface Props {
  chart: HelmChart;
  hideDetails(): void;
}

@observer
export class HelmChartDetails extends Component<Props> {
  @observable chartVersions: HelmChart[];
  @observable selectedChart: HelmChart;
  @observable description: string = null;

  private chartPromise: CancelablePromise<{ readme: string; versions: HelmChart[] }>;

  @disposeOnUnmount
  chartSelector = autorun(async () => {
    if (!this.props.chart) return;
    this.chartVersions = null;
    this.selectedChart = null;
    this.description = null;
    this.loadChartData();
    this.chartPromise.then(data => {
      this.description = data.readme;
      this.chartVersions = data.versions;
      this.selectedChart = data.versions[0];
    });
  });

  loadChartData(version?: string) {
    const { chart: { name, repo } } = this.props;
    if (this.chartPromise) this.chartPromise.cancel();
    this.chartPromise = helmChartsApi.get(repo, name, version);
  }

  @autobind()
  onVersionChange(opt: SelectOption) {
    const version = opt.value;
    this.selectedChart = this.chartVersions.find(chart => chart.version === version);
    this.description = null;
    this.loadChartData(version);
    this.chartPromise.then(data => {
      this.description = data.readme
    });
  }

  @autobind()
  install() {
    createInstallChartTab(this.selectedChart);
    this.props.hideDetails()
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
            <Button primary label={_i18n._(t`Install`)} onClick={this.install}/>
          </div>
          <DrawerItem name={_i18n._(t`Version`)} className="version" onClick={stopPropagation}>
            <Select
              themeName="outlined"
              menuPortalTarget={null}
              options={chartVersions.map(chart => chart.version)}
              value={selectedChart.getVersion()}
              onChange={onVersionChange}
            />
          </DrawerItem>
          <DrawerItem name={_i18n._(t`Home`)}>
            <a href={selectedChart.getHome()} target="_blank">{selectedChart.getHome()}</a>
          </DrawerItem>
          <DrawerItem name={_i18n._(t`Maintainers`)} className="maintainers">
            {selectedChart.getMaintainers().map(({ name, email, url }) =>
              <a key={name} href={url ? url : `mailto:${email}`} target="_blank">{name}</a>
            )}
          </DrawerItem>
          {selectedChart.getKeywords().length > 0 && (
            <DrawerItem name={_i18n._(t`Keywords`)} labelsOnly>
              {selectedChart.getKeywords().map(key => <Badge key={key} label={key}/>)}
            </DrawerItem>
          )}
        </div>
      </div>
    );
  }

  renderContent() {
    if (this.selectedChart === null || this.description === null) return <Spinner center/>;
    return (
      <div className="box grow">
        {this.renderIntroduction()}
        <div className="chart-description">
          <MarkdownViewer markdown={this.description}/>
        </div>
      </div>
    );
  }

  render() {
    const { chart, hideDetails } = this.props;
    const title = chart ? <Trans>Chart: {chart.getFullName()}</Trans> : "";
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