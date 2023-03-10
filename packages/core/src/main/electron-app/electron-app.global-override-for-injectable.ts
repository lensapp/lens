/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kebabCase } from "lodash";
import { getGlobalOverride } from "@k8slens/test-utils";
import electronAppInjectable from "./electron-app.injectable";

export default getGlobalOverride(electronAppInjectable, () => {
  const commandLineArgs: string[] = [];
  const chromiumArgs = new Map<string, string | undefined>();
  const appPaths = new Map<string, string>();

  const app = ({
    getVersion: () => "6.0.0",
    setLoginItemSettings: () => { },
    on: () => app,
    whenReady: async () => {},
    getPath: (name) => appPaths.get(name) ?? `/some-directory-for-${kebabCase(name)}`,
    setPath: (name, value) => appPaths.set(name, value),
    getAppPath: () => "/some-path-to-the-applcation-binary",
    focus: () => {},
    commandLine: {
      appendArgument: (value) => commandLineArgs.push(value),
      appendSwitch: (key, value) => chromiumArgs.set(key, value),
      getSwitchValue: (key) => chromiumArgs.get(key),
      hasSwitch: (key) => chromiumArgs.has(key),
      removeSwitch: (key) => chromiumArgs.delete(key),
    },
    disableHardwareAcceleration: () => {},
    requestSingleInstanceLock: () => true,
    getLoginItemSettings: () => ({
      executableWillLaunchAtLogin: false,
      openAtLogin: false,
      openAsHidden: false,
      wasOpenedAtLogin: false,
      wasOpenedAsHidden: false,
      restoreState: false,
      launchItems: [],
    }),
    exit: () => {},
  } as Partial<Electron.App> as Electron.App);

  return app;
});
