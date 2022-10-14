/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ITerminalOptions } from "xterm";
import { Terminal } from "xterm";

export type CreateTerminalRenderer = (opts: ITerminalOptions) => Terminal;

const createTerminalRendererInjectable = getInjectable({
  id: "create-terminal-renderer",
  instantiate: (): CreateTerminalRenderer => (params) => new Terminal(params),
});

export default createTerminalRendererInjectable;
