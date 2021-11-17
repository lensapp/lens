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

import "./log-controls.scss";

import React from "react";
import { observer } from "mobx-react";

import type { Pod } from "../../../common/k8s-api/endpoints";
import { cssNames, saveFileDialog } from "../../utils";
import { logStore } from "./log.store";
import { Checkbox } from "../checkbox";
import { Icon } from "../icon";
import type { TabId } from "./dock.store";
import { logTabStore } from "./log-tab.store";

interface Props {
  pod: Pod;
  tabId: TabId;
  preferences: {
    showTimestamps: boolean;
    previous: boolean;
  };
  logs: string[];
}

export const LogControls = observer(({ pod, tabId, preferences, logs }: Props) => {
  const since = logStore.getFirstTime(tabId);

  const toggleTimestamps = () => {
    logTabStore.mergeData(tabId, { showTimestamps: !preferences.showTimestamps });
  };

  const togglePrevious = () => {
    logTabStore.mergeData(tabId, { previous: !preferences.previous });
  };

  const downloadLogs = () => {
    saveFileDialog(`${pod.getName()}.log`, logs.join("\n"), "text/plain");
  };

  return (
    <div className={cssNames("LogControls flex gaps align-center justify-space-between wrap")}>
      <div className="time-range">
        {since && (
          <span>
            Logs from <b>{since}</b>
          </span>
        )}
      </div>
      <div className="flex gaps align-center">
        <Checkbox
          label="Show timestamps"
          value={preferences.showTimestamps}
          onChange={toggleTimestamps}
          className="show-timestamps"
        />
        <Checkbox
          label="Show previous terminated container"
          value={preferences.previous}
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
