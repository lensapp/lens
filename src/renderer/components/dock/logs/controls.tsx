/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./controls.scss";

import React from "react";
import { observer } from "mobx-react";

import { cssNames } from "../../../utils";
import { Checkbox } from "../../checkbox";
import { Icon } from "../../icon";
import type { LogTabViewModel } from "./logs-view-model";
import { withInjectables } from "@ogre-tools/injectable-react";
import openSaveFileDialogInjectable from "../../../utils/save-file.injectable";

export interface LogControlsProps {
  model: LogTabViewModel;
}

interface Dependencies {
  openSaveFileDialog: (filename: string, contents: BlobPart | BlobPart[], type: string) => void;
}

const NonInjectedLogControls = observer(({ openSaveFileDialog, model }: Dependencies & LogControlsProps) => {
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

  const downloadLogs = () => {
    const fileName = pod.getName();
    const logsToDownload: string[] = showTimestamps
      ? model.logs.get()
      : model.logsWithoutTimestamps.get();

    openSaveFileDialog(`${fileName}.log`, logsToDownload.join("\n"), "text/plain");
  };

  return (
    <div className={cssNames("LogControls flex gaps align-center justify-space-between wrap")}>
      <div className="time-range">
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

export const LogControls = withInjectables<Dependencies, LogControlsProps>(NonInjectedLogControls, {
  getProps: (di, props) => ({
    openSaveFileDialog: di.inject(openSaveFileDialogInjectable),
    ...props,
  }),
});
