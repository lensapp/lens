import "./install-chart.scss";

import React, { Component } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { dockStore, DockTabData } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { autobind, prevDefault } from "../../utils";
import { ChartInstallData, installChartStore } from "./install-chart.store";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { Button } from "../button";
import { releaseURL } from "../+apps-releases";
import { releaseStore } from "../+apps-releases/release.store";
import { LogsDialog } from "../dialog/logs-dialog";
import { Select, SelectOption } from "../select";
import { Input } from "../input";
import { EditorPanel } from "./editor-panel";
import { navigate } from "../../navigation";
import { _i18n } from "../../i18n";
import { ReleaseUpdateDetails } from "client/api/endpoints/helm-releases.api";

interface Props {
  tab: DockTabData;
}

@observer
export class InstallChart extends Component<Props> {
  @observable error = "";
  @observable showNotes = false;

  get values(): string {
    return this.chartData.values || "";
  }

  get chartData(): ChartInstallData {
    return installChartStore.getData(this.tabId);
  }

  get tabId(): string {
    return this.props.tab.id || "";
  }

  get versions(): string[] {
    return installChartStore.versions.getData(this.tabId);
  }

  get releaseDetails(): ReleaseUpdateDetails {
    return installChartStore.details.getData(this.tabId);
  }

  @autobind()
  viewRelease(): void {
    const { release } = this.releaseDetails;
    navigate(releaseURL({
      params: {
        name: release.name,
        namespace: release.namespace
      }
    }));
    dockStore.closeTab(this.tabId);
  }

  @autobind()
  save(data: Partial<ChartInstallData>): void {
    const chart = { ...this.chartData, ...data };
    installChartStore.setData(this.tabId, chart);
  }

  @autobind()
  onVersionChange(option: SelectOption): void {
    const version = option.value;
    this.save({ version, values: "" });
    installChartStore.loadValues(this.tabId);
  }

  @autobind()
  onValuesChange(values: string, error?: string): void {
    this.error = error;
    this.save({ values });
  }

  @autobind()
  onNamespaceChange(opt: SelectOption): void {
    this.save({ namespace: opt.value });
  }

  @autobind()
  onReleaseNameChange(name: string): void {
    this.save({ releaseName: name });
  }

  install = async (): Promise<JSX.Element> => {
    const { repo, name, version, namespace, values, releaseName } = this.chartData;
    const details = await releaseStore.create({
      name: releaseName || undefined,
      chart: name,
      repo, namespace, version, values,
    });
    installChartStore.details.setData(this.tabId, details);
    return (
      <p><Trans>Chart Release <b>{details.release.name}</b> successfully created.</Trans></p>
    );
  }

  render(): JSX.Element {
    const { tabId, chartData, values, versions, install } = this;
    if (!chartData || chartData.values === undefined || !versions) {
      return <Spinner center/>;
    }

    if (this.releaseDetails) {
      return (
        <div className="InstallChartDone flex column gaps align-center justify-center">
          <p>
            <Icon material="check" big sticker/>
          </p>
          <p><Trans>Installation complete!</Trans></p>
          <div className="flex gaps align-center">
            <Button
              autoFocus primary
              label={_i18n._(t`View Helm Release`)}
              onClick={prevDefault(this.viewRelease)}
            />
            <Button
              plain active
              label={_i18n._(t`Show Notes`)}
              onClick={(): void => {
                this.showNotes = true;
              }}
            />
          </div>
          <LogsDialog
            title={_i18n._(t`Helm Chart Install`)}
            isOpen={this.showNotes}
            close={(): void => {
              this.showNotes = false;
            }}
            logs={this.releaseDetails.log}
          />
        </div>
      );
    }

    const { repo, name, version, namespace, releaseName } = chartData;
    const panelControls = (
      <div className="install-controls flex gaps align-center">
        <span><Trans>Chart</Trans></span>
        <Badge label={`${repo}/${name}`} title={_i18n._(t`Repo/Name`)}/>
        <span><Trans>Version</Trans></span>
        <Select
          className="chart-version"
          value={version}
          options={versions}
          onChange={this.onVersionChange}
          menuPlacement="top"
          themeName="outlined"
        />
        <span><Trans>Namespace</Trans></span>
        <NamespaceSelect
          showIcons={false}
          menuPlacement="top"
          themeName="outlined"
          value={namespace}
          onChange={this.onNamespaceChange}
        />
        <Input
          placeholder={_i18n._(t`Name (optional)`)}
          title={_i18n._(t`Release name`)}
          maxLength={50}
          value={releaseName}
          onChange={this.onReleaseNameChange}
        />
      </div>
    );

    return (
      <div className="InstallChart flex column">
        <EditorPanel
          tabId={tabId}
          value={values}
          onChange={this.onValuesChange}
        />
        <InfoPanel
          tabId={tabId}
          controls={panelControls}
          error={this.error}
          submit={install}
          submitLabel={_i18n._(t`Install`)}
          submittingMessage={_i18n._(t`Installing...`)}
          showSubmitClose={false}
        />
      </div>
    );
  }
}