/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Terminal } from "./terminal";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";

const createTerminalInjectable = getInjectable({
  instantiate: () => (tabId: TabId, api: TerminalApi) => new Terminal(tabId, api),
  lifecycle: lifecycleEnum.singleton,
});

export default createTerminalInjectable;
