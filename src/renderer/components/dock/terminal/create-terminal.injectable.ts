/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Terminal } from "./terminal";
import type { TabId } from "../dock/store";
import type { TerminalApi } from "../../../api/terminal-api";

const createTerminalInjectable = getInjectable({
  id: "create-terminal",
  instantiate: () => (tabId: TabId, api: TerminalApi) => new Terminal(tabId, api),
});

export default createTerminalInjectable;
