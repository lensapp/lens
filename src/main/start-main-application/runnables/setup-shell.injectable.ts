/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";
import { shellEnv } from "../../utils/shell-env";
import os from "os";
import { unionPATHs } from "../../../common/utils/union-env-path";
import isSnapPackageInjectable from "../../../common/vars/is-snap-package.injectable";
import electronAppInjectable from "../../electron-app/electron-app.injectable";

const setupShellInjectable = getInjectable({
  id: "setup-shell",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const isSnapPackage = di.inject(isSnapPackageInjectable);
    const electronApp = di.inject(electronAppInjectable);

    return {
      run: async () => {
        logger.info("🐚 Syncing shell environment");

        const env = await shellEnv(os.userInfo().shell);

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
