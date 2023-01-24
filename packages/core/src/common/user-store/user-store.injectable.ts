/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { UserStore } from "./user-store";
import selectedUpdateChannelInjectable from "../../features/application-update/common/selected-update-channel/selected-update-channel.injectable";
import emitAppEventInjectable from "../app-event-bus/emit-event.injectable";
import loggerInjectable from "../logger.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import storeMigrationsInjectable from "../base-store/migrations.injectable";
import { userStoreMigrationInjectionToken } from "./migrations-token";
import userStorePreferenceDescriptorsInjectable from "./preference-descriptors.injectable";
import createBaseStoreInjectable from "../base-store/create-base-store.injectable";

const userStoreInjectable = getInjectable({
  id: "user-store",

  instantiate: (di) => new UserStore({
    selectedUpdateChannel: di.inject(selectedUpdateChannelInjectable),
    emitAppEvent: di.inject(emitAppEventInjectable),
    logger: di.inject(loggerInjectable),
    storeMigrationVersion: di.inject(storeMigrationVersionInjectable),
    migrations: di.inject(storeMigrationsInjectable, userStoreMigrationInjectionToken),
    preferenceDescriptors: di.inject(userStorePreferenceDescriptorsInjectable),
    createBaseStore: di.inject(createBaseStoreInjectable),
  }),
});

export default userStoreInjectable;
