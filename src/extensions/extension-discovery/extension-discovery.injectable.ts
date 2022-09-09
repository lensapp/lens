/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionDiscovery } from "./extension-discovery";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import isCompatibleExtensionInjectable from "./is-compatible-extension/is-compatible-extension.injectable";
import extensionsStoreInjectable from "../extensions-store/extensions-store.injectable";
import extensionInstallationStateStoreInjectable from "../extension-installation-state-store/extension-installation-state-store.injectable";
import installExtensionInjectable from "../extension-installer/install-extension/install-extension.injectable";
import extensionPackageRootDirectoryInjectable from "../extension-installer/extension-package-root-directory/extension-package-root-directory.injectable";
import installExtensionsInjectable from "../extension-installer/install-extensions/install-extensions.injectable";
import staticFilesDirectoryInjectable from "../../common/vars/static-files-directory.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import loggerInjectable from "../../common/logger.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import watchInjectable from "../../common/fs/watch/watch.injectable";

const extensionDiscoveryInjectable = getInjectable({
  id: "extension-discovery",

  instantiate: (di) =>
    new ExtensionDiscovery({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionsStore: di.inject(extensionsStoreInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
      isCompatibleExtension: di.inject(isCompatibleExtensionInjectable),
      installExtension: di.inject(installExtensionInjectable),
      installExtensions: di.inject(installExtensionsInjectable),
      extensionPackageRootDirectory: di.inject(extensionPackageRootDirectoryInjectable),
      staticFilesDirectory: di.inject(staticFilesDirectoryInjectable),
      readJsonFile: di.inject(readJsonFileInjectable),
      pathExists: di.inject(pathExistsInjectable),
      watch: di.inject(watchInjectable),
      logger: di.inject(loggerInjectable),
    }),
});

export default extensionDiscoveryInjectable;
