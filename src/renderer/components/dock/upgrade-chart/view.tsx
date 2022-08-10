/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./upgrade-chart.scss";

import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../../utils";
import type { DockTab } from "../dock/store";
import { InfoPanel } from "../info-panel";
import { Spinner } from "../../spinner";
import { Badge } from "../../badge";
import { EditorPanel } from "../editor-panel";
import type { SelectOption } from "../../select";
import { Select } from "../../select";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ChartVersion } from "../../+helm-charts/helm-charts/versions.injectable";
import type { UpgradeChartModel } from "./upgrade-chart-model.injectable";
import upgradeChartModelInjectable from "./upgrade-chart-model.injectable";

export interface UpgradeChartProps {
  className?: string;
  tab: DockTab;
}

interface Dependencies {
  model: UpgradeChartModel;
}

@observer
export class NonInjectedUpgradeChart extends React.Component<UpgradeChartProps & Dependencies> {
  @observable error?: string;

  constructor(props: UpgradeChartProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  upgrade = async () => {
    const { model } = this.props;
    const { completedSuccessfully } = await model.submit();

    if (completedSuccessfully) {
      return (
        <p>
          {"Release "}
          <b>{model.release.getName()}</b>
          {" successfully upgraded to version "}
          <b>{model.version.value.get()}</b>
        </p>
      );
    }

    return null;
  };

  render() {
    const { model, className, tab } = this.props;
    const tabId = tab.id;
    const { release } = model;

    return (
      <div className={cssNames("UpgradeChart flex column", className)}>
        <InfoPanel
          tabId={tabId}
          error={model.configration.error.get()}
          submit={this.upgrade}
          submitLabel="Upgrade"
          submittingMessage="Updating.."
          controls={(
            <div className="upgrade flex gaps align-center">
              <span>Release</span>
              {" "}
              <Badge label={release.getName()} />
              <span>Namespace</span>
              {" "}
              <Badge label={release.getNs()} />
              <span>Version</span>
              {" "}
              <Badge label={model.version.value.get()} />
              <span>Upgrade version</span>
              <Select<ChartVersion, SelectOption<ChartVersion>, false>
                id="char-version-input"
                className="chart-version"
                menuPlacement="top"
                themeName="outlined"
                value={model.version.value.get()}
                options={model.versionOptions.get()}
                onChange={model.version.set}
              />
            </div>
          )}
        />
        <EditorPanel
          tabId={tabId}
          value={model.configration.value.get()}
          onChange={model.configration.set}
          onError={model.configration.setError}
        />
      </div>
    );
  }
}

export const UpgradeChart = withInjectables<Dependencies, UpgradeChartProps>(NonInjectedUpgradeChart, {
  getPlaceholder: () => <Spinner center />,
  getProps: async (di, props) => ({
    ...props,
    model: await di.inject(upgradeChartModelInjectable, props.tab),
  }),
});
