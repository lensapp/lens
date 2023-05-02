/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionDiscovery } from "./extension-discovery";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import isCompatibleExtensionInjectable from "./is-compatible-extension/is-compatible-extension.injectable";
import extensionInstallationStateStoreInjectable from "../extension-installation-state-store/extension-installation-state-store.injectable";
import installExtensionInjectable from "../install-extension/install-extension.injectable";
import extensionPackageRootDirectoryInjectable from "../install-extension/extension-package-root-directory.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import watchInjectable from "../../common/fs/watch/watch.injectable";
import accessPathInjectable from "../../common/fs/access-path.injectable";
import copyInjectable from "../../common/fs/copy.injectable";
import ensureDirInjectable from "../../common/fs/ensure-dir.injectable";
import isProductionInjectable from "../../common/vars/is-production.injectable";
import lstatInjectable from "../../common/fs/lstat.injectable";
import readDirectoryInjectable from "../../common/fs/read-directory.injectable";
import fileSystemSeparatorInjectable from "../../common/path/separator.injectable";
import getBasenameOfPathInjectable from "../../common/path/get-basename.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import getRelativePathInjectable from "../../common/path/get-relative-path.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import removePathInjectable from "../../common/fs/remove.injectable";
import homeDirectoryPathInjectable from "../../common/os/home-directory-path.injectable";
import lensResourcesDirInjectable from "../../common/vars/lens-resources-dir.injectable";
import isExtensionEnabledInjectable from "../../features/extensions/enabled/common/is-enabled.injectable";

const extensionDiscoveryInjectable = getInjectable({
  id: "extension-discovery",

  instantiate: (di) => new ExtensionDiscovery({
    extensionLoader: di.inject(extensionLoaderInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    isCompatibleExtension: di.inject(isCompatibleExtensionInjectable),
    installExtension: di.inject(installExtensionInjectable),
    extensionPackageRootDirectory: di.inject(extensionPackageRootDirectoryInjectable),
    resourcesDirectory: di.inject(lensResourcesDirInjectable),
    readJsonFile: di.inject(readJsonFileInjectable),
    pathExists: di.inject(pathExistsInjectable),
    watch: di.inject(watchInjectable),
    logger: di.inject(loggerInjectionToken),
    accessPath: di.inject(accessPathInjectable),
    copy: di.inject(copyInjectable),
    removePath: di.inject(removePathInjectable),
    ensureDirectory: di.inject(ensureDirInjectable),
    isProduction: di.inject(isProductionInjectable),
    lstat: di.inject(lstatInjectable),
    readDirectory: di.inject(readDirectoryInjectable),
    fileSystemSeparator: di.inject(fileSystemSeparatorInjectable),
    getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
    getRelativePath: di.inject(getRelativePathInjectable),
    joinPaths: di.inject(joinPathsInjectable),
    homeDirectoryPath: di.inject(homeDirectoryPathInjectable),
  }),
});

export default extensionDiscoveryInjectable;
