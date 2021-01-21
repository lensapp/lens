import "./helm-chart-details.scss";

import React, { Component } from "react";
import { HelmChart, helmChartsApi } from "../../api/endpoints/helm-charts.api";
import { observable, autorun } from "mobx";
import { observer } from "mobx-react";
import { Drawer, DrawerItem } from "../drawer";
import { autobind, stopPropagation } from "../../utils";
import { MarkdownViewer } from "../markdown-viewer";
import { Spinner } from "../spinner";
import { Button } from "../button";
import { Select, SelectOption } from "../select";
import { createInstallChartTab } from "../dock/install-chart.store";
import { Badge } from "../badge";

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

  private chartPromise: Promise<{ readme: string; versions: HelmChart[] }>;
  private abortController?: AbortController;

  componentWillUnmount() {
    this.abortController?.abort();
  }

  chartUpdater = autorun(() => {
    this.selectedChart = null;
    const { chart: { name, repo, version } } = this.props;

    helmChartsApi.get(repo, name, version).then(result => {
      this.readme = result.readme;
      this.chartVersions = result.versions;
      this.selectedChart = result.versions[0];
    },
    error => {
      this.error = error;
    });
  });

  @autobind()
  async onVersionChange({ value: version }: SelectOption) {
    this.selectedChart = this.chartVersions.find(chart => chart.version === version);
    this.readme = null;

    try {
      this.abortController?.abort();
      // there is no way (by design) to reset an AbortController, so just make a new one
      this.abortController = new AbortController();

      const { chart: { name, repo } } = this.props;
      const { readme } = await (this.chartPromise = helmChartsApi.get(repo, name, version, { signal: this.abortController.signal }));

      this.readme = readme;
    } catch (error) {
      this.error = error;
    }
  }

  @autobind()
  install() {
    createInstallChartTab(this.selectedChart);
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
              options={chartVersions.map(chart => chart.version)}
              value={selectedChart.getVersion()}
              onChange={onVersionChange}
            />
          </DrawerItem>
          <DrawerItem name="Home">
            <a href={selectedChart.getHome()} target="_blank" rel="noreferrer">{selectedChart.getHome()}</a>
          </DrawerItem>
          <DrawerItem name="Maintainers" className="maintainers">
            {selectedChart.getMaintainers().map(({ name, email, url }) =>
              <a key={name} href={url || `mailto:${email}`} target="_blank" rel="noreferrer">{name}</a>
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
    if (!this.selectedChart) {
      return <Spinner center />;
    }

    if (this.error) {
      return (
        <div className="box grow">
          <p className="error">{this.error}</p>
        </div>
      );
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
    const title = chart ? <>Chart: {chart.getFullName()}</> : "";

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
