/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./install-chart.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { DockTabData, TabId } from "../dock/store";
import { InfoPanel } from "../info-panel/info-panel";
import { Badge } from "../../badge";
import { NamespaceSelect } from "../../+namespaces/namespace-select";
import { prevDefault } from "../../../utils";
import type { IChartInstallData, InstallChartManager } from "./store";
import { Spinner } from "../../spinner";
import { Icon } from "../../icon";
import { Button } from "../../button";
import { LogsDialog } from "../../dialog/logs-dialog";
import { Select, SelectOption } from "../../select";
import { Input } from "../../input";
import { EditorPanel } from "../editor/editor-panel";
import { navigate } from "../../../navigation";
import { releaseURL } from "../../../../common/routes";
import type { DockTabStorageLayer } from "../dock-tab/store";
import type { IReleaseCreatePayload, IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "../dock/store.injectable";
import installChartManagerInjectable from "./store.injectable";
import chartVersionManagerInjectable from "./chart-version-manager.injectable";
import releaseDetailsManagerInjectable from "./release-details-manager.injectable";
import { Notifications } from "../../notifications";
import createReleaseInjectable from "../../+helm-releases/create-release.injectable";

export interface InstallChartProps {
  tab: DockTabData;
}

interface DockManager {
  closeTab: (tabId: TabId) => void;
}

interface Dependencies {
  dockManager: DockManager;
  installChartManager: InstallChartManager;
  chartVersionManager: DockTabStorageLayer<string[]>;
  releaseDetailsManager: DockTabStorageLayer<IReleaseUpdateDetails>;
  createRelease: (payload: IReleaseCreatePayload) => Promise<IReleaseUpdateDetails>
}

const NonInjectedInstallChart = observer(({ createRelease, tab, dockManager, installChartManager, chartVersionManager, releaseDetailsManager }: Dependencies & InstallChartProps) => {
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const chartData = installChartManager.getData(tab.id);
  const versions = chartVersionManager.getData(tab.id);
  const releaseDetails = releaseDetailsManager.getData(tab.id);

  useEffect(() => {
    installChartManager.initialLoad(tab.id)
      .catch(err => Notifications.error(String(err)));
  }, []);

  const viewRelease = () => {
    const { release } = releaseDetails;

    navigate(releaseURL({
      params: {
        name: release.name,
        namespace: release.namespace,
      },
    }));
    dockManager.closeTab(tab.id);
  };
  const save = (data: Partial<IChartInstallData>) => {
    installChartManager.setData(tab.id, { ...chartData, ...data });
  };
  const onVersionChange = (option: SelectOption) => {
    const version = option.value;

    save({ version, values: "" });
    installChartManager.loadValues(tab.id);
  };
  const onChange = (values: string) => {
    setError("");
    save({ values });
  };
  const onError = (error: Error | string) => {
    setError(error.toString());
  };

  const onNamespaceChange = (opt: SelectOption) => {
    save({ namespace: opt.value });
  };

  const onReleaseNameChange = (name: string) => {
    save({ releaseName: name });
  };

  const install = async () => {
    const { repo, name, version, namespace, values, releaseName } = chartData;
    const details = await createRelease({
      name: releaseName || undefined,
      chart: name,
      repo, namespace, version, values,
    });

    releaseDetailsManager.setData(tab.id, details);

    return (
      <p>Chart Release <b>{details.release.name}</b> successfully created.</p>
    );
  };

  if (chartData?.values === undefined || !versions) {
    return <Spinner center />;
  }

  if (releaseDetails) {
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
            onClick={prevDefault(viewRelease)}
          />
          <Button
            plain active
            label="Show Notes"
            onClick={() => setShowNotes(true)}
          />
        </div>
        {showNotes && (
          <LogsDialog
            title="Helm Chart Install"
            close={() => setShowNotes(false)}
            logs={releaseDetails.log}
            isOpen={showNotes}
          />
        )}
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
        onChange={onVersionChange}
        menuPlacement="top"
        themeName="outlined"
      />
      <span>Namespace</span>
      <NamespaceSelect
        showIcons={false}
        menuPlacement="top"
        themeName="outlined"
        value={namespace}
        onChange={onNamespaceChange}
      />
      <Input
        placeholder="Name (optional)"
        title="Release name"
        maxLength={50}
        value={releaseName}
        onChange={onReleaseNameChange}
      />
    </div>
  );

  return (
    <div className="InstallChart flex column">
      <InfoPanel
        tabId={tab.id}
        controls={panelControls}
        error={error}
        submit={install}
        submitLabel="Install"
        submittingMessage="Installing..."
        showSubmitClose={false}
      />
      <EditorPanel
        tabId={tab.id}
        value={chartData.values}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
});

export const InstallChart = withInjectables<Dependencies, InstallChartProps>(NonInjectedInstallChart, {
  getProps: (di, props) => ({
    dockManager: di.inject(dockStoreInjectable),
    installChartManager: di.inject(installChartManagerInjectable),
    chartVersionManager: di.inject(chartVersionManagerInjectable),
    releaseDetailsManager: di.inject(releaseDetailsManagerInjectable),
    createRelease: di.inject(createReleaseInjectable),
    ...props,
  }),
});
