/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
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

    try {
      di.register({
        id: filePath,
        ...injectableInstance,
        aliases: [injectableInstance, ...(injectableInstance.aliases || [])],
      });
    } catch (error) {
      throw new Error(`Failed to register ${filePath}: ${error}`);
    }
  }

  di.preventSideEffects();

  if (doGeneralOverrides) {
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
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
