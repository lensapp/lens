/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../runnable-tokens/before-quit-of-back-end-injection-token";
import shellProcessesInjectable from "../../shell-session/shell-processes.injectable";

const cleanUpShellSessionsInjectable = getInjectable({
  id: "clean-up-shell-sessions",

  instantiate: (di) => {
    const shellProcesses = di.inject(shellProcessesInjectable);

    return {
      id: "clean-up-shell-sessions",
      run: () => void shellProcesses.cleanup(),
    };
  },

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default cleanUpShellSessionsInjectable;
