/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onApplicationQuitInjectionToken } from "../on-application-quit-injection-token";
import { ShellSession } from "../../../shell-session/shell-session";

const cleanUpShellSessionsInjectable = getInjectable({
  id: "clean-up-shell-sessions",

  instantiate: () => ({
    run: () => {
      ShellSession.cleanup();
    },
  }),

  injectionToken: onApplicationQuitInjectionToken,
});

export default cleanUpShellSessionsInjectable;
