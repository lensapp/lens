/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Config from "conf";
import type { BaseStoreParams } from "../base-store";
import appVersionInjectable from "./app-version/app-version.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";

const getConfigurationFileModelInjectable = getInjectable({
  id: "get-configuration-file-model",
  instantiate:
    (di) =>
    <ConfigurationContent>(content: BaseStoreParams<ConfigurationContent>) =>
        new Config({
          ...content,
          projectName: "lens",
          projectVersion: di.inject(appVersionInjectable),
          cwd: di.inject(directoryForUserDataInjectable),
        }),

  // Todo: actually this does cause side-effects, but many legacy unit tests use fsMock to unit test this.
  // causesSideEffects: true,
});

export default getConfigurationFileModelInjectable;
