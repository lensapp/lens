/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";

const shellProcessesInjectable = getInjectable({
  id: "shell-processes",
  instantiate: () => new Map<string, IPty>(),
});

export default shellProcessesInjectable;
