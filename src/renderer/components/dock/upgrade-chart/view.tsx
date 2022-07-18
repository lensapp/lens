/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./upgrade-chart.scss";

import React from "react";
import { action, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../../utils";
import type { DockTab } from "../dock/store";
import { InfoPanel } from "../info-panel";
import type { UpgradeChartTabStore } from "./store";
import { Spinner } from "../../spinner";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor-panel";
import type { ChartVersion, HelmChartStore } from "../../+helm-charts/store";
import type { SelectOption } from "../../select";
import { Select } from "../../select";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import upgradeChartTabStoreInjectable from "./store.injectable";
import releasesInjectable from "../../+helm-releases/releases.injectable";
import helmChartStoreInjectable from "../../+helm-charts/store.injectable";
import type { HelmRelease } from "../../../k8s/helm-release";
import type { UpdateHelmRelease } from "../../../k8s/helm-releases.api/update.injectable";
import updateHelmReleaseInjectable from "../../../k8s/helm-releases.api/update.injectable";

export interface UpgradeChartProps {
  className?: string;
  tab: DockTab;
}

interface Dependencies {
  releases: IAsyncComputed<HelmRelease[]>;
  upgradeChartTabStore: UpgradeChartTabStore;
  updateHelmRelease: UpdateHelmRelease;
  helmChartStore: HelmChartStore;
}

@observer
export class NonInjectedUpgradeChart extends React.Component<UpgradeChartProps & Dependencies> {
  @observable error?: string;
  @observable versions = observable.array<ChartVersion>();
  @observable version: ChartVersion | undefined = undefined;

  constructor(props: UpgradeChartProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(
        () => this.release,
        release => this.reloadVersions(release),
        {
          fireImmediately: true,
        },
      ),
      reaction(
        () => this.release?.getRevision(),
        () => this.reloadValues(),
        {
          fireImmediately: true,
        },
      ),
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get release() {
    const tabData = this.props.upgradeChartTabStore.getData(this.tabId);

    if (!tabData) return null;

    return this.props.releases.value.get().find(release => release.getName() === tabData.releaseName);
  }

  get value() {
    return this.props.upgradeChartTabStore.values.getData(this.tabId);
  }

  async reloadValues() {
    this.props.upgradeChartTabStore.reloadValues(this.props.tab.id);
  }

  async reloadVersions(release: HelmRelease | null | undefined) {
    if (!release) {
      return;
    }

    this.version = undefined;
    this.versions.clear();
    const versions = await this.props.helmChartStore.getVersions(release.getChart());

    this.versions.replace(versions);
    this.version = this.versions[0];
  }

  onChange = action((value: string) => {
    this.error = "";
    this.props.upgradeChartTabStore.values.setData(this.tabId, value);
  });

  onError = action((error: Error | string) => {
    this.error = error.toString();
  });

  upgrade = async () => {
    if (this.error || !this.release || !this.version || !this.value) {
      return null;
    }

    const { version, repo } = this.version;
    const releaseName = this.release.getName();
    const releaseNs = this.release.getNs();

    await this.props.updateHelmRelease(releaseName, releaseNs, {
      chart: this.release.getChart(),
      values: this.value,
      repo, version,
    });

    return (
      <p>
        {"Release "}
        <b>{releaseName}</b>
        {" successfully upgraded to version "}
        <b>{version}</b>
      </p>
    );
  };

  render() {
    const { tabId, release, value, error, onChange, onError, upgrade, versions, version } = this;
    const { className } = this.props;

    if (!release || !this.props.upgradeChartTabStore.isReady(tabId) || !version) {
      return <Spinner center />;
    }
    const currentVersion = release.getVersion();
    const versionOptions = versions.map(version => ({
      value: version,
      label: `${version.repo}/${release.getChart()}-${version.version}`,
    }));
    const controlsAndInfo = (
      <div className="upgrade flex gaps align-center">
        <span>Release</span>
        {" "}
        <Badge label={release.getName()} />
        <span>Namespace</span>
        {" "}
        <Badge label={release.getNs()} />
        <span>Version</span>
        {" "}
        <Badge label={currentVersion} />
        <span>Upgrade version</span>
        <Select<ChartVersion, SelectOption<ChartVersion>, false>
          id="char-version-input"
          className="chart-version"
          menuPlacement="top"
          themeName="outlined"
          value={version}
          options={versionOptions}
          onChange={option => this.version = option?.value}
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
          value={value ?? ""}
          onChange={onChange}
          onError={onError}
        />
      </div>
    );
  }
}

export const UpgradeChart = withInjectables<Dependencies, UpgradeChartProps>(NonInjectedUpgradeChart, {
  getProps: (di, props) => ({
    ...props,
    releases: di.inject(releasesInjectable),
    updateHelmRelease: di.inject(updateHelmReleaseInjectable),
    upgradeChartTabStore: di.inject(upgradeChartTabStoreInjectable),
    helmChartStore: di.inject(helmChartStoreInjectable),
  }),
});
