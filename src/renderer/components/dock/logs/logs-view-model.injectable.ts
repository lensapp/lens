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
import updateTabNameInjectable from "./update-tab-name.injectable";
import stopLoadingLogsInjectable from "./stop-loading-logs.injectable";
import { podsStore } from "../../+workloads-pods/pods.store";
import createSearchStoreInjectable from "../../../search-store/create-search-store.injectable";

export interface InstantiateArgs {
  tabId: TabId;
}

const logsViewModelInjectable = getInjectable({
  instantiate: (di, { tabId }: InstantiateArgs) => new LogTabViewModel(tabId, {
    getLogs: di.inject(getLogsInjectable),
    getLogsWithoutTimestamps: di.inject(getLogsWithoutTimestampsInjectable),
    getTimestampSplitLogs: di.inject(getTimestampSplitLogsInjectable),
    reloadLogs: di.inject(reloadLogsInjectable),
    getLogTabData: di.inject(getLogTabDataInjectable),
    setLogTabData: di.inject(setLogTabDataInjectable),
    loadLogs: di.inject(loadLogsInjectable),
    updateTabName: di.inject(updateTabNameInjectable),
    stopLoadingLogs: di.inject(stopLoadingLogsInjectable),
    getPodById: id => podsStore.getById(id),
    getPodsByOwnerId: id => podsStore.getPodsByOwnerId(id),
    createSearchStore: di.inject(createSearchStoreInjectable),
  }),
  lifecycle: lifecycleEnum.transient,
});

export default logsViewModelInjectable;
