/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import shellProcessesInjectable from "./shell-processes.injectable";

const killAllShellProcessesInjectable = getInjectable({
  id: "kill-all-shell-processes",
  instantiate: (di) => {
    const shellProcesses = di.inject(shellProcessesInjectable);

    return () => {
      for (const shellProcess of shellProcesses.values()) {
        try {
          process.kill(shellProcess.pid);
        } catch {
        // ignore error
        }
      }

      shellProcesses.clear();
    };
  },
});

export default killAllShellProcessesInjectable;
