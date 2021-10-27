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

import React from "react";
import { action, computed, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { Select, SelectOption } from "../select";
import { dockStore, TabId, TabKind } from "./dock.store";
import type { IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { upgradeChartStore } from "./upgrade-chart.store";
import { DockTabContentProps, dockViewsManager } from "./dock.views-manager";
import { EditorPanel } from "./editor-panel";
import { Spinner } from "../spinner";

interface Props extends DockTabContentProps {
}

@observer
export class UpgradeChart extends React.Component<Props> {
  @observable selectedVersion: IChartVersion;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      dockStore.onTabChange(({ tabId }) => this.onTabChange(tabId), {
        tabKind: TabKind.UPGRADE_CHART,
        fireImmediately: true,
      }),
    ]);
  }

  @action
  async onTabChange(tabId: TabId) {
    await upgradeChartStore.load(tabId);
    this.selectedVersion = upgradeChartStore.versions.get(tabId)?.[0];
  }

  get tabId(): TabId {
    return this.props.tabId;
  }

  get release(): HelmRelease | undefined {
    return upgradeChartStore.releases.get(this.tabId);
  }

  @computed get chartVersions(): SelectOption<IChartVersion>[] {
    const chartName = this.release.getChart();
    const versions = upgradeChartStore.versions.get(this.tabId) ?? [];

    return versions.map(value => ({
      label: `${value.repo}/${chartName}-${value.version}`,
      value,
    }));
  }

  upgrade = async () => {
    await upgradeChartStore.updateRelease(this.tabId, this.selectedVersion);

    return (
      <p>
        Release <b>{this.release.getName()}</b> successfully upgraded to version <b>{this.selectedVersion.version}</b>
      </p>
    );
  };

  render() {
    if (!upgradeChartStore.isReady(this.tabId)) {
      return <Spinner center/>;
    }

    const { release, selectedVersion, chartVersions, tabId } = this;

    return (
      <div className="UpgradeChart">
        <InfoPanel
          tabId={this.tabId}
          submit={this.upgrade}
          submitLabel="Upgrade"
          submittingMessage="Updating.."
          controls={
            <div className="upgrade flex gaps align-center">
              <span>Release</span> <Badge label={release.getName()}/>
              <span>Namespace</span> <Badge label={release.getNs()}/>
              <span>Version</span> <Badge label={release.getVersion()}/>
              <span>Upgrade version</span>
              <Select
                className="chart-version"
                menuPlacement="top"
                themeName="outlined"
                value={selectedVersion}
                options={chartVersions}
                onChange={({ value }: SelectOption<IChartVersion>) => this.selectedVersion = value}
              />
            </div>
          }
        />
        <EditorPanel
          tabId={tabId}
          value={upgradeChartStore.values.get(tabId)}
          onChange={v => upgradeChartStore.values.set(tabId, v)}
        />
      </div>
    );
  }
}

dockViewsManager.register(TabKind.UPGRADE_CHART, {
  Content: UpgradeChart,
});
