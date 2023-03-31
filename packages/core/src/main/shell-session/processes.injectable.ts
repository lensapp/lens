/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";

export type ShellSessionProcesses = Map<string, IPty>;

const shellSessionProcessesInjectable = getInjectable({
  id: "shell-session-processes",
  instantiate: (): ShellSessionProcesses => new Map(),
});

export default shellSessionProcessesInjectable;
