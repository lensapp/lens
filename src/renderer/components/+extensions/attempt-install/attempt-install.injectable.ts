/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";
import { attemptInstall } from "./attempt-install";
import unpackExtensionInjectable from "./unpack-extension/unpack-extension.injectable";
import getExtensionDestFolderInjectable from "./get-extension-dest-folder/get-extension-dest-folder.injectable";
import createTempFilesAndValidateInjectable from "./create-temp-files-and-validate/create-temp-files-and-validate.injectable";
import removeDirInjectable from "../../../../common/fs/remove-dir.injectable";
import getInstallationStateInjectable from "../../../extensions/installation-state/get-installation-state.injectable";
import getInstalledExtensionInjectable from "../../../../extensions/extension-loader/get-installed-extension.injectable";

const attemptInstallInjectable = getInjectable({
  instantiate: (di) =>
    attemptInstall({
      getInstalledExtension: di.inject(getInstalledExtensionInjectable),
      uninstallExtension: di.inject(uninstallExtensionInjectable),
      unpackExtension: di.inject(unpackExtensionInjectable),
      createTempFilesAndValidate: di.inject(createTempFilesAndValidateInjectable),
      getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
      getInstallationState: di.inject(getInstallationStateInjectable),
      removeDir: di.inject(removeDirInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default attemptInstallInjectable;
