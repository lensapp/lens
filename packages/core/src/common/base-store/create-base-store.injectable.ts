/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";
import getBasenameOfPathInjectable from "../path/get-basename.injectable";
import { enlistMessageChannelListenerInjectionToken } from "@k8slens/messaging";
import type { BaseStoreDependencies, BaseStoreParams } from "./base-store";
import { BaseStore } from "./base-store";
import { baseStoreIpcChannelPrefixesInjectionToken } from "./channel-prefix";
import { shouldBaseStoreDisableSyncInIpcListenerInjectionToken } from "./disable-sync";
import { persistStateToConfigInjectionToken } from "./save-to-file";

export type CreateBaseStore = <T extends object>(params: BaseStoreParams<T>) => BaseStore<T>;

const createBaseStoreInjectable = getInjectable({
  id: "create-base-store",
  instantiate: (di): CreateBaseStore => {
    const deps: BaseStoreDependencies = {
      directoryForUserData: di.inject(directoryForUserDataInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
      logger: di.inject(loggerInjectable),
      getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
      ipcChannelPrefixes: di.inject(baseStoreIpcChannelPrefixesInjectionToken),
      persistStateToConfig: di.inject(persistStateToConfigInjectionToken),
      enlistMessageChannelListener: di.inject(enlistMessageChannelListenerInjectionToken),
      shouldDisableSyncInListener: di.inject(shouldBaseStoreDisableSyncInIpcListenerInjectionToken),
    };

    return (params) => new BaseStore(deps, params);
  },
});

export default createBaseStoreInjectable;
