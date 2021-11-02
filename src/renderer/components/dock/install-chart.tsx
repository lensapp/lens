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

import "./install-chart.scss";

import React, { Component } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { dockStore, DockTab } from "./dock.store";
import { InfoPanel } from "./info-panel";
import { Badge } from "../badge";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { boundMethod, prevDefault } from "../../utils";
import { IChartInstallData, installChartStore } from "./install-chart.store";
import { Spinner } from "../spinner";
import { Icon } from "../icon";
import { Button } from "../button";
import { releaseStore } from "../+apps-releases/release.store";
import { LogsDialog } from "../dialog/logs-dialog";
import { Select, SelectOption } from "../select";
import { Input } from "../input";
import { EditorPanel } from "./editor-panel";
import { navigate } from "../../navigation";
import { releaseURL } from "../../../common/routes";

interface Props {
  tab: DockTab;
}

@observer
export class InstallChart extends Component<Props> {
  @observable error = "";
  @observable showNotes = false;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  get values() {
    return this.chartData.values;
  }

  get chartData() {
    return installChartStore.getData(this.tabId);
  }

  get tabId() {
    return this.props.tab.id;
  }

  get versions() {
    return installChartStore.versions.getData(this.tabId);
  }

  get releaseDetails() {
    return installChartStore.details.getData(this.tabId);
  }

  @boundMethod
  viewRelease() {
    const { release } = this.releaseDetails;

    navigate(releaseURL({
      params: {
        name: release.name,
        namespace: release.namespace,
      },
    }));
    dockStore.closeTab(this.tabId);
  }

  @boundMethod
  save(data: Partial<IChartInstallData>) {
    const chart = { ...this.chartData, ...data };

    installChartStore.setData(this.tabId, chart);
  }

  @boundMethod
  onVersionChange(option: SelectOption) {
    const version = option.value;

    this.save({ version, values: "" });
    installChartStore.loadValues(this.tabId);
  }

  @boundMethod
  onValuesChange(values: string, error?: string) {
    this.error = error;
    this.save({ values });
  }

  @boundMethod
  onNamespaceChange(opt: SelectOption) {
    this.save({ namespace: opt.value });
  }

  @boundMethod
  onReleaseNameChange(name: string) {
    this.save({ releaseName: name });
  }

  install = async () => {
    const { repo, name, version, namespace, values, releaseName } = this.chartData;
    const details = await releaseStore.create({
      name: releaseName || undefined,
      chart: name,
      repo, namespace, version, values,
    });

    installChartStore.details.setData(this.tabId, details);

    return (
      <p>Chart Release <b>{details.release.name}</b> successfully created.</p>
    );
  };

  render() {
    const { tabId, chartData, values, versions, install } = this;

    if (chartData?.values === undefined || !versions) {
      return <Spinner center />;
    }

    if (this.releaseDetails) {
      return (
        <div className="InstallChartDone flex column gaps align-center justify-center">
          <p>
            <Icon material="check" big sticker />
          </p>
          <p>Installation complete!</p>
          <div className="flex gaps align-center">
            <Button
              autoFocus primary
              label="View Helm Release"
              onClick={prevDefault(this.viewRelease)}
            />
            <Button
              plain active
              label="Show Notes"
              onClick={() => this.showNotes = true}
            />
          </div>
          <LogsDialog
            title="Helm Chart Install"
            isOpen={this.showNotes}
            close={() => this.showNotes = false}
            logs={this.releaseDetails.log}
          />
        </div>
      );
    }

    const { repo, name, version, namespace, releaseName } = chartData;
    const panelControls = (
      <div className="install-controls flex gaps align-center">
        <span>Chart</span>
        <Badge label={`${repo}/${name}`} title="Repo/Name" />
        <span>Version</span>
        <Select
          className="chart-version"
          value={version}
          options={versions}
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
    );

    return (
      <div className="InstallChart flex column">
        <InfoPanel
          tabId={tabId}
          controls={panelControls}
          error={this.error}
          submit={install}
          submitLabel="Install"
          submittingMessage="Installing..."
          showSubmitClose={false}
        />
        <EditorPanel
          tabId={tabId}
          value={values}
          onChange={this.onValuesChange}
        />
      </div>
    );
  }
}
