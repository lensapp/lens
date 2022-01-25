/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { TerminalStore } from "./store";
import terminalStoreInjectable from "./store.injectable";

interface Dependencies {
  terminalStore: TerminalStore;
}

function clearTerminalTabData({ terminalStore }: Dependencies, tabId: TabId): void {
  terminalStore.destroy(tabId);
}

const clearTerminalTabDataInjectable = getInjectable({
  instantiate: (di) => bind(clearTerminalTabData, null, {
    terminalStore: di.inject(terminalStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clearTerminalTabDataInjectable;
