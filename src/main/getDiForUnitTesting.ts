/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { kebabCase, memoize } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";

import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import getElectronAppPathInjectable from "./app-paths/get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./app-paths/set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "./app-paths/app-name/app-name.injectable";
import registerChannelInjectable from "./app-paths/register-channel/register-channel.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import directoryForBundledBinariesInjectable from "../common/app-paths/directory-for-bundled-binaries/directory-for-bundled-binaries.injectable";
import loggerInjectable from "../common/logger.injectable";
import spawnInjectable from "./child-process/spawn.injectable";
import extensionsStoreInjectable from "../extensions/extensions-store/extensions-store.injectable";
import type { ExtensionsStore } from "../extensions/extensions-store/extensions-store";
import fileSystemProvisionerStoreInjectable from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../common/cluster-store/cluster-store";
import type { Cluster } from "../common/cluster/cluster";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import isMacInjectable from "../common/vars/is-mac.injectable";
import isWindowsInjectable from "../common/vars/is-windows.injectable";
import isLinuxInjectable from "../common/vars/is-linux.injectable";
import getAbsolutePathInjectable from "../common/path/get-absolute-path.injectable";
import { getAbsolutePathFake } from "../common/test-utils/get-absolute-path-fake";
import joinPathsInjectable from "../common/path/join-paths.injectable";
import { joinPathsFake } from "../common/test-utils/join-paths-fake";
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import type { GetDiForUnitTestingOptions } from "../test-utils/get-dis-for-unit-testing";

export interface GetMainDiForUnitTestingOptions extends GetDiForUnitTestingOptions {
  overrideHotbarStore?: boolean;
  overrideUserStore?: boolean;
  overrideExtensionsStore?: boolean;
  overrideClusterStore?: boolean;
  overrideFileSystemProvisionerStore?: boolean;
}

export function getDiForUnitTesting(opts: GetMainDiForUnitTestingOptions = {}) {
  const {
    doGeneralOverrides = false,
  } = opts;
  const {
    overrideHotbarStore = doGeneralOverrides,
    overrideUserStore = doGeneralOverrides,
    overrideExtensionsStore = doGeneralOverrides,
    overrideClusterStore = doGeneralOverrides,
    overrideFileSystemProvisionerStore = doGeneralOverrides,
  } = opts;

  const di = createContainer();

  setLegacyGlobalDiForExtensionApi(di, Environments.main);

  for (const filePath of getInjectableFilePaths()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const injectableInstance = require(filePath).default;

    di.register({
      ...injectableInstance,
      aliases: [injectableInstance, ...(injectableInstance.aliases || [])],
    });
  }

  di.preventSideEffects();

  if (overrideHotbarStore) {
    di.override(hotbarStoreInjectable, () => ({}));
  }

  if (overrideUserStore) {
    di.override(userStoreInjectable, () => ({}));
  }

  if (overrideExtensionsStore) {
    di.override(extensionsStoreInjectable, () => ({ isEnabled: (opts) => (void opts, false) }) as ExtensionsStore);
  }

  if (overrideClusterStore) {
    di.override(clusterStoreInjectable, () => ({ getById: (id) => (void id, {}) as Cluster }) as ClusterStore);
  }

  if (overrideFileSystemProvisionerStore) {
    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);
  }

  if (doGeneralOverrides) {
    di.override(isMacInjectable, () => true);
    di.override(isWindowsInjectable, () => false);
    di.override(isLinuxInjectable, () => false);

    di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
    di.override(joinPathsInjectable, () => joinPathsFake);

    di.override(
      getElectronAppPathInjectable,
      () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
    );

    di.override(setElectronAppPathInjectable, () => () => undefined);
    di.override(appNameInjectable, () => "some-electron-app-name");
    di.override(registerChannelInjectable, () => () => undefined);
    di.override(directoryForBundledBinariesInjectable, () => "some-bin-directory");
    di.override(spawnInjectable, () => () => {
      return {
        stderr: { on: jest.fn(), removeAllListeners: jest.fn() },
        stdout: { on: jest.fn(), removeAllListeners: jest.fn() },
        on: jest.fn(),
      } as never;
    });

    di.override(writeJsonFileInjectable, () => () => {
      throw new Error("Tried to write JSON file to file system without specifying explicit override.");
    });

    di.override(readJsonFileInjectable, () => () => {
      throw new Error("Tried to read JSON file from file system without specifying explicit override.");
    });

    di.override(readFileInjectable, () => () => {
      throw new Error("Tried to read file from file system without specifying explicit override.");
    });

    di.override(loggerInjectable, () => ({
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
    }));
  }

  return di;
}

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
