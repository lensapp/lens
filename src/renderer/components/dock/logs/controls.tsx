/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./controls.module.scss";

import React from "react";
import { observer } from "mobx-react";

import { Checkbox } from "../../checkbox";
import type { LogTabViewModel } from "./logs-view-model";
import { withInjectables } from "@ogre-tools/injectable-react";
import openSaveFileDialogInjectable from "../../../utils/save-file.injectable";
import { DownloadLogsDropdown } from "./download-logs-dropdown";
import type { ResourceDescriptor } from "../../../../common/k8s-api/kube-api";
import downloadAllLogsInjectable from "./download-all-logs.injectable";
import type { PodLogsQuery } from "../../../../common/k8s-api/endpoints";

export interface LogControlsProps {
  model: LogTabViewModel;
}

interface Dependencies {
  openSaveFileDialog: (filename: string, contents: BlobPart | BlobPart[], type: string) => void;
  downloadAllLogs: (params: ResourceDescriptor, query: PodLogsQuery) => Promise<void>;
}

const NonInjectedLogControls = observer(({ openSaveFileDialog, model, downloadAllLogs }: Dependencies & LogControlsProps) => {
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
    return new Promise((resolve) => {
      const fileName = pod.getName();
      const logsToDownload: string[] = showTimestamps
        ? model.logs.get()
        : model.logsWithoutTimestamps.get();

      openSaveFileDialog(`${fileName}.log`, logsToDownload.join("\n"), "text/plain");
      resolve(true);
    });
  };

  return (
    <div className={styles.controls}>
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
          downloadVisibleLogs={downloadLogs}
          downloadAllLogs={() => downloadAllLogs(
            { name: pod.getName(), namespace: pod.getNs() },
            { timestamps: showTimestamps, previous }
          )}
        />
      </div>
    </div>
  );
});

export const LogControls = withInjectables<Dependencies, LogControlsProps>(NonInjectedLogControls, {
  getProps: (di, props) => ({
    openSaveFileDialog: di.inject(openSaveFileDialogInjectable),
    downloadAllLogs: di.inject(downloadAllLogsInjectable),
    ...props,
  }),
});
