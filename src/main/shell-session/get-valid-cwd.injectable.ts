/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { homedir } from "os";
import statInjectable from "../../common/fs/stat.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";

export type GetValidCwd = (cwd: string | undefined, env: Record<string, string | undefined>) => Promise<string>;

const getValidCwdInjectable = getInjectable({
  id: "get-valid-cwd",
  instantiate: (di): GetValidCwd => {
    const stat = di.inject(statInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const isMac = di.inject(isMacInjectable);

    return async (cwd, env) => {
      const cwdOptions = [cwd];

      if (isWindows) {
        cwdOptions.push(
          env.USERPROFILE,
          homedir(),
          "C:\\",
        );
      } else {
        cwdOptions.push(
          env.HOME,
          homedir(),
        );

        if (isMac) {
          cwdOptions.push("/Users");
        } else {
          cwdOptions.push("/home");
        }
      }

      for (const potentialCwd of cwdOptions) {
        if (!potentialCwd) {
          continue;
        }

        try {
          const stats = await stat(potentialCwd);

          if (stats.isDirectory()) {
            return potentialCwd;
          }
        } catch {
        // ignore error
        }
      }

      return "."; // Always valid
    };
  },
});

export default getValidCwdInjectable;
