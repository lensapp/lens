/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onQuitOfBackEndInjectionToken } from "../runnable-tokens/phases";
import shellSessionProcessesInjectable from "../../shell-session/processes.injectable";
import { prefixedLoggerInjectable } from "@k8slens/logger";

const cleanUpShellSessionsInjectable = getInjectable({
  id: "clean-up-shell-sessions",

  instantiate: (di) => ({
    run: () => {
      const shellSessionProcesses = di.inject(shellSessionProcessesInjectable);
      const logger = di.inject(prefixedLoggerInjectable, "SHELL-SESSIONS");

      logger.info("Killing all remaining shell sessions");

      for (const { pid } of shellSessionProcesses.values()) {
        try {
          process.kill(pid);
        } catch {
          // ignore error
        }
      }

      shellSessionProcesses.clear();

      return undefined;
    },
  }),

  injectionToken: onQuitOfBackEndInjectionToken,
});

export default cleanUpShellSessionsInjectable;
