/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import isSnapPackageInjectable from "../../../common/vars/is-snap-package.injectable";
import electronAppInjectable from "../../../main/electron-app/electron-app.injectable";
import computeShellEnvironmentInjectable from "./compute-shell-environment.injectable";
import emitShellSyncFailedInjectable from "./emit-failure.injectable";
import { unionPATHs } from "@k8slens/utilities";
import userShellSettingInjectable from "../../user-preferences/common/shell-setting.injectable";

const setupShellInjectable = getInjectable({
  id: "setup-shell",

  instantiate: (di) => ({
    run: async () => {
      const logger = di.inject(loggerInjectionToken);
      const isSnapPackage = di.inject(isSnapPackageInjectable);
      const electronApp = di.inject(electronAppInjectable);
      const resolvedUserShellSetting = di.inject(userShellSettingInjectable);
      const computeShellEnvironment = di.inject(computeShellEnvironmentInjectable);
      const emitShellSyncFailed = di.inject(emitShellSyncFailedInjectable);

      logger.info("🐚 Syncing shell environment");

      const result = await computeShellEnvironment(resolvedUserShellSetting.get());

      if (!result.callWasSuccessful) {
        logger.error(`[SHELL-SYNC]: ${result.error}`);
        emitShellSyncFailed(result.error);

        return;
      }

      const env = result.response;

      if (!env) {
        logger.debug("[SHELL-SYNC]: nothing to do, env not special in shells");

        return;
      }

      if (!env.LANG) {
        // the LANG env var expects an underscore instead of electron's dash
        env.LANG = `${electronApp.getLocale().replace("-", "_")}.UTF-8`;
      } else if (!env.LANG.endsWith(".UTF-8")) {
        env.LANG += ".UTF-8";
      }

      if (!isSnapPackage) {
        // Prefer the synced PATH over the initial one
        process.env.PATH = unionPATHs(env.PATH ?? "", process.env.PATH ?? "");
      }

      // The spread operator allows joining of objects. The precedence is last to first.
      process.env = {
        ...env,
        ...process.env,
      };

      logger.info(`[SHELL-SYNC]: Synced shell env`);
      logger.debug(`[SHELL-SYNC]: updated env`, process.env);
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupShellInjectable;
