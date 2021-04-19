import "./log-controls.scss";

import React from "react";
import { observer } from "mobx-react";

import { Pod } from "../../api/endpoints";
import { cssNames, saveFileDialog } from "../../utils";
import { logStore } from "./log.store";
import { Checkbox } from "../checkbox";
import { Icon } from "../icon";
import { LogTabData } from "./log-tab.store";

interface Props {
  tabData?: LogTabData
  logs: string[]
  save: (data: Partial<LogTabData>) => void
  reload: () => void
}

export const LogControls = observer((props: Props) => {
  const { tabData, save, reload, logs } = props;

  if (!tabData) {
    return null;
  }

  const { showTimestamps, previous } = tabData;
  const since = logs.length ? logStore.getTimestamps(logs[0]) : null;
  const pod = new Pod(tabData.selectedPod);

  const toggleTimestamps = () => {
    save({ showTimestamps: !showTimestamps });
  };

  const togglePrevious = () => {
    save({ previous: !previous });
    reload();
  };

  const downloadLogs = () => {
    const fileName = pod.getName();
    const logsToDownload = showTimestamps ? logs : logStore.logsWithoutTimestamps;

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
