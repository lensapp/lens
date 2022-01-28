/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { TerminalApi } from "../../../api/terminal-api";
import { bind } from "../../../utils";
import type { TabId } from "../dock/store";
import type { TerminalStore } from "./store";
import terminalStoreInjectable from "./store.injectable";

interface Dependencies {
  terminalStore: TerminalStore;
}

function getTerminalApi({ terminalStore }: Dependencies, tabId: TabId): TerminalApi {
  return terminalStore.getTerminalApi(tabId);
}

const getTerminalApiInjectable = getInjectable({
  instantiate: (di) => bind(getTerminalApi, null, {
    terminalStore: di.inject(terminalStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default getTerminalApiInjectable;
