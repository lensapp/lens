/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./install-chart.scss";

import React, { Component } from "react";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { DockStore, DockTab } from "../dock/store";
import { InfoPanel } from "../info-panel";
import { Badge } from "../../badge";
import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { prevDefault } from "../../../utils";
import type { IChartInstallData, InstallChartTabStore } from "./store";
import { Spinner } from "../../spinner";
import { Icon } from "../../icon";
import { Button } from "../../button";
import { LogsDialog } from "../../dialog/logs-dialog";
import type { SelectOption } from "../../select";
import { Select } from "../../select";
import { Input } from "../../input";
import { EditorPanel } from "../editor-panel";
import type { HelmReleaseCreatePayload, HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import installChartTabStoreInjectable from "./store.injectable";
import dockStoreInjectable from "../dock/store.injectable";
import createReleaseInjectable from "../../+helm-releases/create-release/create-release.injectable";
import { Notifications } from "../../notifications";
import type { NavigateToHelmReleases } from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import assert from "assert";
import type { SingleValue } from "react-select";

export interface InstallCharProps {
  tab: DockTab;
}

interface Dependencies {
  createRelease: (payload: HelmReleaseCreatePayload) => Promise<HelmReleaseUpdateDetails>;
  installChartStore: InstallChartTabStore;
  dockStore: DockStore;
  navigateToHelmReleases: NavigateToHelmReleases;
}

@observer
class NonInjectedInstallChart extends Component<InstallCharProps & Dependencies> {
  @observable error = "";
  @observable showNotes = false;

  constructor(props: InstallCharProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount(): void {
    this.props.installChartStore.loadData(this.tabId)
      .catch(err => Notifications.error(String(err)));
  }

  get chartData() {
    return this.props.installChartStore.getData(this.tabId);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get versions() {
    return this.props.installChartStore.versions.getData(this.tabId);
  }

  get releaseDetails() {
    return this.props.installChartStore.details.getData(this.tabId);
  }

  viewRelease = ({ release }: HelmReleaseUpdateDetails) => {
    this.props.navigateToHelmReleases({
      name: release.name,
      namespace: release.namespace,
    });
    this.props.dockStore.closeTab(this.tabId);
  };

  save(data: Partial<IChartInstallData>) {
    assert(this.chartData, "Cannot update data before data exists");

    this.props.installChartStore.setData(this.tabId, { ...this.chartData, ...data });
  }

  onVersionChange = (option: SingleValue<SelectOption<string>>) => {
    if (option) {
      this.save({ ...option, values: "" });
      this.props.installChartStore.loadValues(this.tabId);
    }
  };

  onChange = action((values: string) => {
    this.error = "";
    this.save({ values });
  });

  onError = action((error: Error | string) => {
    this.error = error.toString();
  });

  onNamespaceChange = (option: SingleValue<SelectOption<string>>) => {
    if (option) {
      this.save({ namespace: option.value });
    }
  };

  onReleaseNameChange = (name: string) => {
    this.save({ releaseName: name });
  };

  install = async ({ repo, name, version, namespace, values = "", releaseName }: IChartInstallData) => {
    const details = await this.props.createRelease({
      name: releaseName || undefined,
      chart: name,
      repo,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      namespace: namespace!,
      version,
      values,
    });

    this.props.installChartStore.details.setData(this.tabId, details);

    return (
      <p>
        {"Chart Release "}
        <b>{details.release.name}</b>
        {" successfully created."}
      </p>
    );
  };

  render() {
    const { tabId, chartData, versions, install, releaseDetails } = this;

    if (chartData?.values === undefined || !versions) {
      return <Spinner center />;
    }

    if (releaseDetails) {
      return (
        <div className="InstallChartDone flex column gaps align-center justify-center">
          <p>
            <Icon
              material="check"
              big
              sticker
            />
          </p>
          <p>Installation complete!</p>
          <div className="flex gaps align-center">
            <Button
              autoFocus
              primary
              label="View Helm Release"
              onClick={prevDefault(() => this.viewRelease(releaseDetails))}
            />
            <Button
              plain
              active
              label="Show Notes"
              onClick={() => this.showNotes = true}
            />
          </div>
          <LogsDialog
            title="Helm Chart Install"
            isOpen={this.showNotes}
            close={() => this.showNotes = false}
            logs={releaseDetails.log}
          />
        </div>
      );
    }

    const { repo, name, version, namespace, releaseName } = chartData;
    const versionOptions = versions.map(version => ({
      value: version,
      label: version,
    }));

    return (
      <div className="InstallChart flex column">
        <InfoPanel
          tabId={tabId}
          controls={(
            <div className="install-controls flex gaps align-center">
              <span>Chart</span>
              <Badge label={`${repo}/${name}`} title="Repo/Name" />
              <span>Version</span>
              <Select
                className="chart-version"
                value={version}
                options={versionOptions}
                onChange={this.onVersionChange}
                menuPlacement="top"
                themeName="outlined"
              />
              <span>Namespace</span>
              <NamespaceSelect
                showIcons={false}
                menuPlacement="top"
                themeName="outlined"
                value={namespace}
                onChange={this.onNamespaceChange}
              />
              <Input
                placeholder="Name (optional)"
                title="Release name"
                maxLength={50}
                value={releaseName}
                onChange={this.onReleaseNameChange}
              />
            </div>
          )}
          error={this.error}
          submit={() => install(chartData)}
          disableSubmit={!chartData.namespace}
          submitLabel="Install"
          submittingMessage="Installing..."
          showSubmitClose={false}
        />
        <EditorPanel
          tabId={tabId}
          value={chartData.values}
          onChange={this.onChange}
          onError={this.onError}
        />
      </div>
    );
  }
}

export const InstallChart = withInjectables<Dependencies, InstallCharProps>(
  NonInjectedInstallChart,

  {
    getProps: (di, props) => ({
      createRelease: di.inject(createReleaseInjectable),
      installChartStore: di.inject(installChartTabStoreInjectable),
      dockStore: di.inject(dockStoreInjectable),
      navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
      ...props,
    }),
  },
);
