/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";
import os from "os";
import { unionPATHs } from "../../../common/utils/union-env-path";
import isSnapPackageInjectable from "../../../common/vars/is-snap-package.injectable";
import electronAppInjectable from "../../electron-app/electron-app.injectable";
import computeShellEnvironmentInjectable from "../../utils/shell-env/compute-shell-environment.injectable";

const setupShellInjectable = getInjectable({
  id: "setup-shell",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const isSnapPackage = di.inject(isSnapPackageInjectable);
    const electronApp = di.inject(electronAppInjectable);
    const computeShellEnvironment = di.inject(computeShellEnvironmentInjectable);

    return {
      id: "setup-shell",
      run: async (): Promise<void> => {
        logger.info("🐚 Syncing shell environment");

        const result = await computeShellEnvironment(os.userInfo().shell);

        if (!result.callWasSuccessful) {
          return void logger.error(`[SHELL-SYNC]: ${result.error}`);
        }

        const env = result.response;

        if (!env) {
          return void logger.debug("[SHELL-SYNC]: nothing to do, env not special in shells");
        }

        if (!env.LANG) {
          // the LANG env var expects an underscore instead of electron's dash
          env.LANG = `${electronApp.getLocale().replace("-", "_")}.UTF-8`;
        } else if (!env.LANG.endsWith(".UTF-8")) {
          env.LANG += ".UTF-8";
        }

        if (!isSnapPackage) {
          // Prefer the synced PATH over the initial one
          process.env.PATH = unionPATHs(env.PATH ?? "",  process.env.PATH ?? "");
        }

        // The spread operator allows joining of objects. The precedence is last to first.
        process.env = {
          ...env,
          ...process.env,
        };

        logger.debug(`[SHELL-SYNC]: Synced shell env, and updating`, env, process.env);
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
  causesSideEffects: true,
});

export default setupShellInjectable;
