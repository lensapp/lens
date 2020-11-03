import "./helm-chart-details.scss";

import React, { Component } from "react";
import { HelmChart, helmChartsApi } from "../../api/endpoints/helm-charts.api";
import { t, Trans } from "@lingui/macro";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
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
  @observable readme: string = null;
  @observable error: string = null;

  private chartPromise: CancelablePromise<{ readme: string; versions: HelmChart[] }>;

  componentWillUnmount() {
    this.chartPromise?.cancel();
  }

  chartUpdater = autorun(() => {
    this.selectedChart = null
    const { chart: { name, repo, version } } = this.props
    helmChartsApi.get(repo, name, version).then(result => {
      this.readme = result.readme
      this.chartVersions = result.versions
      this.selectedChart = result.versions[0]
    },
    error => {
      this.error = error;
    })
  });

  @autobind()
  async onVersionChange({ value: version }: SelectOption) {
    this.selectedChart = this.chartVersions.find(chart => chart.version === version);
    this.readme = null;

    try {
      this.chartPromise?.cancel();
      const { chart: { name, repo } } = this.props;
      const { readme } = await (this.chartPromise = helmChartsApi.get(repo, name, version))
      this.readme = readme;
    } catch (error) {
      this.error = error;
    }
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
            <Button primary label={_i18n._(t`Install`)} onClick={this.install} />
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
              <a key={name} href={url || `mailto:${email}`} target="_blank">{name}</a>
            )}
          </DrawerItem>
          {selectedChart.getKeywords().length > 0 && (
            <DrawerItem name={_i18n._(t`Keywords`)} labelsOnly>
              {selectedChart.getKeywords().map(key => <Badge key={key} label={key} />)}
            </DrawerItem>
          )}
        </div>
      </div>
    );
  }

  renderReadme() {
    if (this.readme === null) {
      return <Spinner center />
    }

    return (
      <div className="chart-description">
        <MarkdownViewer markdown={this.readme} />
      </div>
    )
  }

  renderContent() {
    if (!this.selectedChart) {
      return <Spinner center />;
    }

    if (this.error) {
      return (
        <div className="box grow">
          <p className="error">{this.error}</p>
        </div>
      )
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
