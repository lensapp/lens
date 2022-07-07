/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import appVersionInjectable from "../../common/get-configuration-file-model/app-version/app-version.injectable";
import getConfigurationFileModelInjectable from "../../common/get-configuration-file-model/get-configuration-file-model.injectable";
import loggerInjectable from "../../common/logger.injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  id: "extensions-store",

  instantiate: (di) => {
    ExtensionsStore.resetInstance();

    return ExtensionsStore.createInstance({
      logger: di.inject(loggerInjectable),
      getConfigurationFileModel: di.inject(getConfigurationFileModelInjectable),
      appVersion: di.inject(appVersionInjectable),
      directoryForUserData: di.inject(directoryForUserDataInjectable),
    });
  },

  causesSideEffects: true,
});

export default extensionsStoreInjectable;
