/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./controls.scss";

import React from "react";
import { observer } from "mobx-react";

import { Pod } from "../../../../common/k8s-api/endpoints";
import { cssNames, saveFileDialog } from "../../../utils";
import { Checkbox } from "../../checkbox";
import { Icon } from "../../icon";
import type { LogTabViewModel } from "./logs-view-model";

export interface LogControlsProps {
  model: LogTabViewModel;
}

export const LogControls = observer(({ model }: LogControlsProps) => {
  const tabData = model.logTabData.get();

  if (!tabData) {
    return null;
  }

  const logs = model.timestampSplitLogs.get();
  const { showTimestamps, previous } = tabData;
  const since = logs.length ? logs[0][0] : null;
  const pod = new Pod(tabData.selectedPod);

  const toggleTimestamps = () => {
    model.updateLogTabData({ showTimestamps: !showTimestamps });
  };

  const togglePrevious = () => {
    model.updateLogTabData({ previous: !previous });
    model.reloadLogs();
  };

  const downloadLogs = () => {
    const fileName = pod.getName();
    const logsToDownload: string[] = showTimestamps
      ? model.logs.get()
      : model.logsWithoutTimestamps.get();

    saveFileDialog(`${fileName}.log`, logsToDownload.join("\n"), "text/plain");
  };

  return (
    <div className={cssNames("LogControls flex gaps align-center justify-space-between wrap")}>
      <div className="time-range">
        {since && (
          <span>
            Logs from{" "}
            <b>{new Date(since[0]).toLocaleString()}</b>
          </span>
        )}
      </div>
      <div className="flex gaps align-center">
        <Checkbox
          label="Show timestamps"
          value={showTimestamps}
          onChange={toggleTimestamps}
          className="show-timestamps"
        />
        <Checkbox
          label="Show previous terminated container"
          value={previous}
          onChange={togglePrevious}
          className="show-previous"
        />
        <Icon
          material="get_app"
          onClick={downloadLogs}
          tooltip="Download"
          className="download-icon"
        />
      </div>
    </div>
  );
});
