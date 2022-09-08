/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import moment from "moment";
import userStoreInjectable from "../../../../common/user-store/user-store.injectable";
import type { TabId } from "../dock/store";
import getLogTabDataInjectable from "./get-log-tab-data.injectable";
import getLogsWithoutTimestampsInjectable from "./get-logs-without-timestamps.injectable";
import getTimestampSplitLogsInjectable from "./get-timestamp-split-logs.injectable";

const getVisibleLogsInjectable = getInjectable({
  id: "get-visible-logs",

  instantiate: (di) => {
    return (tabId: TabId) => {
      const getLogTabData = di.inject(getLogTabDataInjectable);
      const getTimestampSplitLogs = di.inject(getTimestampSplitLogsInjectable);
      const userStore = di.inject(userStoreInjectable);
      const logTabData = getLogTabData(tabId);

      if (!logTabData) {
        return [];
      }

      const { showTimestamps } = logTabData;

      if (!showTimestamps) {
        const getLogsWithoutTimestamps = di.inject(getLogsWithoutTimestampsInjectable);
        
        return getLogsWithoutTimestamps(tabId);
      }

      return getTimestampSplitLogs(tabId).map(([logTimestamp, log]) => (
        `${logTimestamp && moment.tz(logTimestamp, userStore.localeTimezone).format()}${log}`
      ));
    };
  },
});

export default getVisibleLogsInjectable;
