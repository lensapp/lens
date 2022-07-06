/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../runnable-tokens/before-quit-of-back-end-injection-token";
import killAllShellProcessesInjectable from "../../shell-session/kill-all-processes.injectable";

const cleanUpShellSessionsInjectable = getInjectable({
  id: "clean-up-shell-sessions",

  instantiate: (di) => ({
    run: di.inject(killAllShellProcessesInjectable),
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default cleanUpShellSessionsInjectable;
