/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";
import { attemptInstall } from "./attempt-install";
import unpackExtensionInjectable from "./unpack-extension/unpack-extension.injectable";
import getExtensionDestFolderInjectable
  from "./get-extension-dest-folder/get-extension-dest-folder.injectable";
import createTempFilesAndValidateInjectable from "./create-temp-files-and-validate/create-temp-files-and-validate.injectable";
import extensionInstallationStateStoreInjectable
  from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

const attemptInstallInjectable = getInjectable({
  instantiate: (di) =>
    attemptInstall({
      extensionLoader: di.inject(extensionLoaderInjectable),
      uninstallExtension: di.inject(uninstallExtensionInjectable),
      unpackExtension: di.inject(unpackExtensionInjectable),
      createTempFilesAndValidate: di.inject(createTempFilesAndValidateInjectable),
      getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default attemptInstallInjectable;
