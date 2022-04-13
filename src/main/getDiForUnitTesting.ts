/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { kebabCase, memoize, noop } from "lodash/fp";
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
import fileSystemProvisionerStoreInjectable from "../extensions/extension-loader/create-extension-instance/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../extensions/extension-loader/create-extension-instance/file-system-provisioner-store/file-system-provisioner-store";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import type { ClusterStore } from "../common/cluster-store/cluster-store";
import type { Cluster } from "../common/cluster/cluster";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import type { UserStore } from "../common/user-store";
import isMacInjectable from "../common/vars/is-mac.injectable";
import isWindowsInjectable from "../common/vars/is-windows.injectable";
import isLinuxInjectable from "../common/vars/is-linux.injectable";
import getAbsolutePathInjectable from "../common/path/get-absolute-path.injectable";
import { getAbsolutePathFake } from "../common/test-utils/get-absolute-path-fake";
import joinPathsInjectable from "../common/path/join-paths.injectable";
import { joinPathsFake } from "../common/test-utils/join-paths-fake";
import hotbarStoreInjectable from "../common/hotbar-store.injectable";
import whenApplicationIsActivatedInjectable from "./electron-app/when-application-is-activated.injectable";
import whenApplicationWillQuitInjectable from "./electron-app/when-application-will-quit.injectable";
import whenOpeningUrlInjectable from "./electron-app/when-opening-url.injectable";
import whenSecondInstanceInjectable from "./electron-app/when-second-instance.injectable";
import whenSystemShutdownInjectable from "./electron-app/when-system-shutdown.injectable";
import exitAppInjectable from "./electron-app/exit-app.injectable";
import setApplicationNameInjectable from "./electron-app/set-application-name.injectable";
import getCommandLineSwitchInjectable from "./electron-app/get-command-line-switch.injectable";
import isAutoUpdateEnabledInjectable from "./is-auto-update-enabled.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import { EventEmitter } from "../common/event-emitter";
import type { AppEvent } from "../common/app-event-bus/event-bus";
import registerProtocolClientInjectable from "./electron-app/register-protocol-client.injectable";
import commandLineArgumentsInjectable from "./utils/command-line-arguments.injectable";

export const getDiForUnitTesting = (
  { doGeneralOverrides } = { doGeneralOverrides: false },
) => {
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

  if (doGeneralOverrides) {
    di.override(isMacInjectable, () => true);
    di.override(isWindowsInjectable, () => false);
    di.override(isLinuxInjectable, () => false);

    di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
    di.override(joinPathsInjectable, () => joinPathsFake);

    di.override(whenApplicationIsActivatedInjectable, () => () => {});
    di.override(whenApplicationWillQuitInjectable, () => () => {});
    di.override(whenOpeningUrlInjectable, () => () => {});
    di.override(whenSecondInstanceInjectable, () => () => {});
    di.override(whenSystemShutdownInjectable, () => () => {});
    di.override(exitAppInjectable, () => () => {});
    di.override(setApplicationNameInjectable, () => () => {});
    di.override(getCommandLineSwitchInjectable, () => () => "irrelevant");
    di.override(isAutoUpdateEnabledInjectable, () => () => false);
    di.override(registerProtocolClientInjectable, () => () => {});

    di.override(commandLineArgumentsInjectable, () => []);

    // TODO: Remove usages of globally exported appEventBus to get rid of this
    di.override(appEventBusInjectable, () => new EventEmitter<[AppEvent]>());

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(hotbarStoreInjectable, () => ({}));

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);
    di.override(userStoreInjectable, () => ({}) as UserStore);

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
      } as any;
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
      warn: noop,
      debug: noop,
      error: (message: string, ...args: any) => console.error(message, ...args),
      info: noop,
    }));
  }

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
