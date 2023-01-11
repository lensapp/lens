/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./controls.module.scss";

import { observer } from "mobx-react";
import React from "react";

import { Checkbox } from "../../checkbox";
import { DownloadLogsDropdown } from "./download-logs-dropdown";
import type { LogTabViewModel } from "./logs-view-model";

export interface LogControlsProps {
  model: LogTabViewModel;
}

export const LogControls = observer(({ model }: LogControlsProps) => {
  const tabData = model.logTabData.get();
  const pod = model.pod.get();

  if (!tabData || !pod) {
    return null;
  }

  const logs = model.timestampSplitLogs.get();
  const { showTimestamps, showPrevious: previous } = tabData;
  const since = logs.length ? logs[0][0] : null;

  const toggleTimestamps = () => {
    model.updateLogTabData({ showTimestamps: !showTimestamps });
  };

  const togglePrevious = () => {
    model.updateLogTabData({ showPrevious: !previous });
    model.reloadLogs();
  };

  return (
    <div className={styles.controls} data-testid="log-controls">
      <div>
        {since && (
          <span>
            Logs from
            {" "}
            <b>{new Date(since).toLocaleString()}</b>
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

        <DownloadLogsDropdown
          disabled={logs.length === 0}
          downloadVisibleLogs={model.downloadLogs}
          downloadAllLogs={model.downloadAllLogs}
        />
      </div>
    </div>
  );
});

