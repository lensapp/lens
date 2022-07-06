/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import type { Cluster } from "../../common/cluster/cluster";
import appVersionInjectable from "../../common/get-configuration-file-model/app-version/app-version.injectable";
import resolvedShellInjectable from "../../common/user-store/resolved-shell.injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import appNameInjectable from "../app-paths/app-name/app-name.injectable";
import { clearKubeconfigEnvVars } from "../utils/clear-kube-env-vars";
import shellEnvInjectable from "../utils/shell-env.injectable";

export interface GetShellEnvArgs {
  cluster: Cluster;
  initialPathEntries: string[];
  kubectlBinDirP: Promise<string>;
  kubeconfigPathP: Promise<string>;
}
export type GetShellEnv = (args: GetShellEnvArgs) => Promise<Record<string, string | undefined>>;

const getShellEnvInjectable = getInjectable({
  id: "get-shell-env",
  instantiate: (di): GetShellEnv => {
    const isWindows = di.inject(isWindowsInjectable);
    const shellEnv = di.inject(shellEnvInjectable);
    const resolvedShell = di.inject(resolvedShellInjectable);
    const appName = di.inject(appNameInjectable);
    const appVersion = di.inject(appVersionInjectable);

    return async ({ cluster, initialPathEntries, kubeconfigPathP, kubectlBinDirP }) => {
      const env = clearKubeconfigEnvVars(JSON.parse(JSON.stringify(await shellEnv())));
      const shell = resolvedShell.get();
      const initialPATH = [await kubectlBinDirP, ...initialPathEntries, process.env.PATH].join(path.delimiter);

      delete env.DEBUG; // don't pass DEBUG into shells

      if (isWindows) {
        env.SystemRoot = process.env.SystemRoot;
        env.PTYSHELL = shell || "powershell.exe";
        env.PATH = initialPATH;
        env.LENS_SESSION = "true";
        env.WSLENV = [
          process.env.WSLENV,
          "KUBECONFIG/up:LENS_SESSION/u",
        ]
          .filter(Boolean)
          .join(":");
      } else if (shell !== undefined) {
        env.PTYSHELL = shell;
        env.PATH = initialPATH;
      } else {
        env.PTYSHELL = ""; // blank runs the system default shell
      }

      if (path.basename(env.PTYSHELL) === "zsh") {
        env.OLD_ZDOTDIR = env.ZDOTDIR || env.HOME;
        env.ZDOTDIR = await kubectlBinDirP;
        env.DISABLE_AUTO_UPDATE = "true";
      }

      env.PTYPID = process.pid.toString();
      env.KUBECONFIG = await kubeconfigPathP;
      env.TERM_PROGRAM = appName;
      env.TERM_PROGRAM_VERSION = appVersion;

      if (cluster.preferences.httpsProxy) {
        env.HTTPS_PROXY = cluster.preferences.httpsProxy;
      }

      env.NO_PROXY = [
        "localhost",
        "127.0.0.1",
        env.NO_PROXY,
      ]
        .filter(Boolean)
        .join();

      return env;
    };
  },
});

export default getShellEnvInjectable;
