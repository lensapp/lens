/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./upgrade-chart.scss";

import React from "react";
import { autorun, computed, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import type { DockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { upgradeChartStore } from "./upgrade-chart.store";
import { Spinner } from "../spinner";
import { releaseStore } from "../+apps-releases/release.store";
import { Badge } from "../badge";
import { MonacoEditor } from "../monaco-editor";
import { Select, SelectOption } from "../select";
import type { IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";

interface Props {
  className?: string;
  tab: DockTab;
}

@observer
export class UpgradeChart extends React.Component<Props> {
  @observable error: string;
  @observable selectedVersion: IChartVersion;

  constructor(props: Props) {
    super(props);
    makeObservable(this);

    disposeOnUnmount(this, [
      autorun(() => upgradeChartStore.loadData(this.tabId)),
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get release(): HelmRelease | null {
    return upgradeChartStore.getRelease(this.tabId);
  }

  get isReady(){
    return [
      upgradeChartStore.dataReady,
      this.release,
      this.selectedVersion,
    ].every(Boolean);
  }

  @computed get versionOptions(): SelectOption<IChartVersion>[] {
    return upgradeChartStore.versions.map(version => ({ value: version }));
  }

  get value() {
    return upgradeChartStore.values.get(this.tabId);
  }

  onChange = (value: string) => {
    upgradeChartStore.values.set(this.tabId, value);
  };

  onError = (error: string) => {
    this.error = error;
  };

  upgrade = async () => {
    if (this.error) return null;
    const { version, repo } = this.selectedVersion;
    const releaseName = this.release.getName();
    const releaseNs = this.release.getNs();

    await releaseStore.update(releaseName, releaseNs, {
      chart: this.release.getChart(),
      values: this.value,
      repo, version,
    });

    return (
      <p>
        Release <b>{releaseName}</b> successfully upgraded to version <b>{version}</b>
      </p>
    );
  };

  formatVersionLabel = ({ value }: SelectOption<IChartVersion>) => {
    const chartName = this.release.getChart();
    const { repo, version } = value;

    return `${repo}/${chartName}-${version}`;
  };

  render() {
    if (!this.isReady) {
      return <Spinner center/>;
    }

    const { className } = this.props;
    const { tabId, release, value, error, versionOptions, selectedVersion } = this;
    const currentVersion = release.getVersion();

    const controlsAndInfo = (
      <div className="upgrade flex gaps align-center">
        <span>Release</span> <Badge label={release.getName()}/>
        <span>Namespace</span> <Badge label={release.getNs()}/>
        <span>Version</span> <Badge label={currentVersion}/>
        <span>Upgrade version</span>
        <Select
          className="chart-version"
          menuPlacement="top"
          themeName="outlined"
          value={selectedVersion}
          options={versionOptions}
          formatOptionLabel={this.formatVersionLabel}
          onChange={({ value }: SelectOption) => this.selectedVersion = value}
        />
      </div>
    );

    return (
      <div className={cssNames("UpgradeChart flex column", className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={this.upgrade}
          submitLabel="Upgrade"
          submittingMessage="Updating.."
          controls={controlsAndInfo}
        />
        <MonacoEditor
          id={tabId}
          value={value}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}
