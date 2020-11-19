import "./upgrade-chart.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { cssNames } from "../../utils";
import { IDockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { upgradeChartStore } from "./upgrade-chart.store";
import { Spinner } from "../spinner";
import { releaseStore } from "../+apps-releases/release.store";
import { Badge } from "../badge";
import { EditorPanel } from "./editor-panel";
import { helmChartStore, IChartVersion } from "../+apps-helm-charts/helm-chart.store";
import { HelmRelease } from "../../api/endpoints/helm-releases.api";
import { Select, SelectOption } from "../select";
import { _i18n } from "../../i18n";

interface Props {
  className?: string;
  tab: IDockTab;
}

@observer
export class UpgradeChart extends React.Component<Props> {
  @observable error: string;
  @observable versions = observable.array<IChartVersion>();
  @observable version: IChartVersion;

  componentDidMount() {
    this.loadVersions();

    disposeOnUnmount(this, [
      reaction(() => this.release, () => this.loadVersions())
    ]);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get release(): HelmRelease {
    const tabData = upgradeChartStore.getData(this.tabId);
    if (!tabData) return;
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
    if (this.error) return;
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
        <Trans>Release <b>{releaseName}</b> successfully upgraded to version <b>{version}</b></Trans>
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
        <span><Trans>Release</Trans></span> <Badge label={release.getName()}/>
        <span><Trans>Namespace</Trans></span> <Badge label={release.getNs()}/>
        <span><Trans>Version</Trans></span> <Badge label={currentVersion}/>
        <span><Trans>Upgrade version</Trans></span>
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
          submitLabel={_i18n._(t`Upgrade`)}
          submittingMessage={_i18n._(t`Updating..`)}
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
