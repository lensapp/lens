/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./download-logs-dropdown.module.scss";

import React, { useState } from "react";
import { Icon } from "../../icon";
import { MenuItem } from "../../menu";
import { Dropdown } from "../../dropdown/dropdown";

interface DownloadLogsDropdownProps {
  downloadVisibleLogs: () => void;
  downloadAllLogs: () => Promise<void> | undefined;
}

export function DownloadLogsDropdown({ downloadAllLogs, downloadVisibleLogs }: DownloadLogsDropdownProps) {
  const [waiting, setWaiting] = useState(false);

  const downloadAll = async () => {
    setWaiting(true);

    try {
      await downloadAllLogs();
    } finally {
      setWaiting(false);
    }
  };

  return (
    <Dropdown
      id="download-logs-dropdown"
      contentForToggle={(
        <button
          data-testid="download-logs-dropdown"
          className={styles.dropdown}
          disabled={waiting}
        >
          Download
          <Icon material="arrow_drop_down" smallest/>
        </button>
      )}
    >
      <MenuItem onClick={downloadVisibleLogs} data-testid="download-visible-logs">
        Visible logs
      </MenuItem>
      <MenuItem onClick={downloadAll} data-testid="download-all-logs">
        All logs
      </MenuItem>
    </Dropdown>
  );
}
