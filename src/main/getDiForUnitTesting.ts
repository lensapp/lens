/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize, kebabCase } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";

import { setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import getElectronAppPathInjectable from "./app-paths/get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./app-paths/set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "./app-paths/app-name/app-name.injectable";
import registerEventSinkInjectable from "../common/communication/register-event-sink.injectable";
import registerChannelInjectable from "./communication/register-channel.injectable";
import { overrideFsFunctions } from "../test-utils/override-fs-functions";

interface DiForTestingOptions {
  doGeneralOverrides?: boolean;
  doIpcOverrides?: boolean;
}

export async function getDiForUnitTesting({ doGeneralOverrides = false, doIpcOverrides = true }: DiForTestingOptions = {}) {
  const di = createContainer();

  setLegacyGlobalDiForExtensionApi(di);

  for (const filePath of getInjectableFilePaths()) {
    const { default: injectableInstance } = await import(filePath);

    di.register({
      id: filePath,
      ...injectableInstance,
      aliases: [injectableInstance, ...(injectableInstance.aliases || [])],
    });
  }

  di.preventSideEffects();

  if (doGeneralOverrides) {
    di.override(getElectronAppPathInjectable, () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`);

    di.override(setElectronAppPathInjectable, () => () => undefined);
    di.override(appNameInjectable, () => "some-electron-app-name");

    overrideFsFunctions(di);
  }

  if (doIpcOverrides) {
    di.override(registerEventSinkInjectable, () => () => () => undefined);
    di.override(registerChannelInjectable, () => () => () => undefined);
  }

  return di;
}

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
