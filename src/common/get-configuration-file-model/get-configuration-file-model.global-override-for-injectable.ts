/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import assert from "assert";
import path from "path";
import { getGlobalOverride } from "../test-utils/get-global-override";
import getConfigurationFileModelInjectable from "./get-configuration-file-model.injectable";
import type Config from "conf";
import readJsonSyncInjectable from "../fs/read-json-sync.injectable";
import writeJsonSyncInjectable from "../fs/write-json-sync.injectable";

export default getGlobalOverride(getConfigurationFileModelInjectable, (di) => {
  const readJsonSync = di.inject(readJsonSyncInjectable);
  const writeJsonSync = di.inject(writeJsonSyncInjectable);

  return (options) => {
    assert(options.cwd, "Missing options.cwd");
    assert(options.configName, "Missing options.configName");

    const configFilePath = path.posix.join(options.cwd, `${options.configName}.json`);
    let store: object = {};

    try {
      store = readJsonSync(configFilePath);
    } catch {
      // ignore
    }

    return {
      get store() {
        return store;
      },
      path: configFilePath,
      set: (key: string, value: unknown) => {
        let currentState: object;

        try {
          currentState = readJsonSync(configFilePath);
        } catch {
          currentState = {};
        }

        writeJsonSync(configFilePath, {
          ...currentState,
          [key]: value,
        });
        store = readJsonSync(configFilePath);
      },
    } as Partial<Config> as Config<any>;
  };
});
