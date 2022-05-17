/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LogTabViewModel } from "./logs-view-model";
import type { TabId } from "../dock/store";
import getLogsInjectable from "./get-logs.injectable";
import getLogsWithoutTimestampsInjectable from "./get-logs-without-timestamps.injectable";
import getTimestampSplitLogsInjectable from "./get-timestamp-split-logs.injectable";
import reloadLogsInjectable from "./reload-logs.injectable";
import getLogTabDataInjectable from "./get-log-tab-data.injectable";
import loadLogsInjectable from "./load-logs.injectable";
import setLogTabDataInjectable from "./set-log-tab-data.injectable";
import stopLoadingLogsInjectable from "./stop-loading-logs.injectable";
import renameTabInjectable from "../dock/rename-tab.injectable";
import areLogsPresentInjectable from "./are-logs-present.injectable";
import searchStoreInjectable from "../../../search-store/search-store.injectable";
import getPodsByOwnerIdInjectable from "../../+workloads-pods/get-pods-by-owner-id.injectable";
import getPodByIdInjectable from "../../+workloads-pods/get-pod-by-id.injectable";

export interface InstantiateArgs {
  tabId: TabId;
}

const logsViewModelInjectable = getInjectable({
  id: "logs-view-model",

  instantiate: (di, { tabId }: InstantiateArgs) => new LogTabViewModel(tabId, {
    getLogs: di.inject(getLogsInjectable),
    getLogsWithoutTimestamps: di.inject(getLogsWithoutTimestampsInjectable),
    getTimestampSplitLogs: di.inject(getTimestampSplitLogsInjectable),
    reloadLogs: di.inject(reloadLogsInjectable),
    getLogTabData: di.inject(getLogTabDataInjectable),
    setLogTabData: di.inject(setLogTabDataInjectable),
    loadLogs: di.inject(loadLogsInjectable),
    renameTab: di.inject(renameTabInjectable),
    stopLoadingLogs: di.inject(stopLoadingLogsInjectable),
    areLogsPresent: di.inject(areLogsPresentInjectable),
    getPodById: di.inject(getPodByIdInjectable),
    getPodsByOwnerId: di.inject(getPodsByOwnerIdInjectable),
    searchStore: di.inject(searchStoreInjectable),
  }),
  lifecycle: lifecycleEnum.transient,
});

export default logsViewModelInjectable;
