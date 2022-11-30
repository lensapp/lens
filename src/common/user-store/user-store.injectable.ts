/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";
import selectedUpdateChannelInjectable from "../../features/application-update/common/selected-update-channel/selected-update-channel.injectable";
import emitAppEventInjectable from "../app-event-bus/emit-event.injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../logger.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";

const userStoreInjectable = getInjectable({
  id: "user-store",

  instantiate: (di) => new UserStore({
    selectedUpdateChannel: di.inject(selectedUpdateChannelInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
  }),
});

export default userStoreInjectable;
