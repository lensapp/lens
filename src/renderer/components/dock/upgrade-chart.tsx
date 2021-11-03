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
import { observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import type { DockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { upgradeChartStore } from "./upgrade-chart.store";
import { Spinner } from "../spinner";
import { releaseStore } from "../+apps-releases/release.store";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { helmChartStore, IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { Select, SelectOption } from "../select";

interface Props {
  className?: string;
  tab: DockTab;
}

@observer
export class UpgradeChart extends React.Component<Props> {
  @observable error: string;
  @observable versions = observable.array<IChartVersion>();
  @observable version: IChartVersion;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.loadVersions();

    disposeOnUnmount(this, [
      reaction(() => this.release, () => this.loadVersions()),
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get release(): HelmRelease {
    const tabData = upgradeChartStore.getData(this.tabId);

    if (!tabData) return null;

    return releaseStore.getByName(tabData.releaseName);
  }

  get value() {
    return upgradeChartStore.values.getData(this.tabId);
  }

  async loadVersions() {
    if (!this.release) return;
    this.version = null;
    this.versions.clear();
    const versions = await helmChartStore.getVersions(this.release.getChart());

    this.versions.replace(versions);
    this.version = this.versions[0];
  }

  onChange = (value: string, error?: string) => {
    upgradeChartStore.values.setData(this.tabId, value);
    this.error = error;
  };

  upgrade = async () => {
    if (this.error) return null;
    const { version, repo } = this.version;
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
    const { tabId, release, value, error, onChange, upgrade, versions, version } = this;
    const { className } = this.props;

    if (!release || upgradeChartStore.isLoading() || !version) {
      return <Spinner center/>;
    }
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
          value={version}
          options={versions}
          formatOptionLabel={this.formatVersionLabel}
          onChange={({ value }: SelectOption) => this.version = value}
        />
      </div>
    );

    return (
      <div className={cssNames("UpgradeChart flex column", className)}>
        <InfoPanel
          tabId={tabId}
          error={error}
          submit={upgrade}
          submitLabel="Upgrade"
          submittingMessage="Updating.."
          controls={controlsAndInfo}
        />
        <EditorPanel
          tabId={tabId}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }
}
