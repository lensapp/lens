/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { kebabCase, memoize, noop } from "lodash/fp";
import type { DiContainer } from "@ogre-tools/injectable";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
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
import isAutoUpdateEnabledInjectable from "./is-auto-update-enabled.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import { EventEmitter } from "../common/event-emitter";
import type { AppEvent } from "../common/app-event-bus/event-bus";
import commandLineArgumentsInjectable from "./utils/command-line-arguments.injectable";
import initializeExtensionsInjectable from "./start-main-application/after-application-is-ready/implementations/initialize-extensions.injectable";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import registerFileProtocolInjectable from "./electron-app/features/register-file-protocol.injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
import { CatalogCategoryRegistry } from "../common/catalog";
import catalogCategoryRegistryInjectable from "../common/catalog/catalog-category-registry.injectable";
import setupIpcMainHandlersInjectable from "./electron-app/after-application-is-ready/setup-ipc-main-handlers/setup-ipc-main-handlers.injectable";
import setupLensProxyInjectable from "./start-main-application/after-application-is-ready/implementations/setup-lens-proxy.injectable";
import setupRunnablesForAfterRootFrameIsReadyInjectable from "./start-main-application/after-application-is-ready/implementations/setup-runnables-for-after-root-frame-is-ready.injectable";
import setupOsThemeUpdatesInjectable from "./electron-app/after-application-is-ready/setup-os-theme-updates.injectable";
import setupSentryInjectable from "./start-main-application/after-application-is-ready/implementations/setup-sentry.injectable";
import setupShellInjectable from "./start-main-application/after-application-is-ready/implementations/setup-shell.injectable";
import setupSyncingOfWeblinksInjectable from "./start-main-application/after-application-is-ready/implementations/setup-syncing-of-weblinks.injectable";
import stopServicesAndExitAppInjectable from "./stop-services-and-exit-app.injectable";
import trayInjectable from "./tray/tray.injectable";
import applicationMenuInjectable from "./menu/application-menu.injectable";
import windowManagerInjectable from "./window-manager.injectable";
import isDevelopmentInjectable from "../common/vars/is-development.injectable";
import setupSystemCaInjectable from "./start-main-application/after-application-is-ready/implementations/setup-system-ca.injectable";
import setupDeepLinkingInjectable from "./electron-app/after-application-is-ready/setup-deep-linking.injectable";
import exitAppInjectable from "./electron-app/features/exit-app.injectable";
import getCommandLineSwitchInjectable from "./electron-app/features/get-command-line-switch.injectable";
import requestSingleInstanceLockInjectable from "./electron-app/features/request-single-instance-lock.injectable";
import disableHardwareAccelerationInjectable from "./electron-app/features/disable-hardware-acceleration.injectable";
import shouldStartHiddenInjectable from "./electron-app/features/should-start-hidden.injectable";
import getElectronAppPathInjectable from "./app-paths/get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./app-paths/set-electron-app-path/set-electron-app-path.injectable";
import setupMainWindowVisibilityAfterActivationInjectable from "./electron-app/after-application-is-ready/setup-main-window-visibility-after-activation.injectable";
import setupDeviceShutdownInjectable from "./electron-app/after-application-is-ready/setup-device-shutdown.injectable";
import setupApplicationNameInjectable from "./electron-app/before-application-is-ready/setup-application-name.injectable";
import setupRunnablesBeforeClosingOfApplicationInjectable from "./electron-app/before-application-is-ready/setup-runnables-before-closing-of-application.injectable";

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
    overrideOperatingSystem(di);
    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);

    di.override(isDevelopmentInjectable, () => false);
    di.override(environmentVariablesInjectable, () => ({}));
    di.override(commandLineArgumentsInjectable, () => []);

    di.override(stopServicesAndExitAppInjectable, () => () => {});
    di.override(lensResourcesDirInjectable, () => "/irrelevant");
    di.override(windowManagerInjectable, () => ({ ensureMainWindow: () => Promise.resolve(null) }));

    di.override(trayInjectable, () => ({ start: () => {}, stop: () => {} }));
    di.override(applicationMenuInjectable, () => ({ start: () => {}, stop: () => {} }));

    di.override(catalogCategoryRegistryInjectable, () => new CatalogCategoryRegistry());

    // TODO: Remove usages of globally exported appEventBus to get rid of this
    di.override(appEventBusInjectable, () => new EventEmitter<[AppEvent]>());

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(hotbarStoreInjectable, () => ({ load: () => {} }));

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ provideInitialFromMain: () => {}, getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);
    di.override(userStoreInjectable, () => ({ startMainReactions: () => {} }) as UserStore);

    di.override(appNameInjectable, () => "some-app-name");
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

// TODO: Reorganize code in Runnables to get rid of requirement for override
const overrideRunnablesHavingSideEffects = (di: DiContainer) => {
  [
    initializeExtensionsInjectable,
    setupIpcMainHandlersInjectable,
    setupLensProxyInjectable,
    setupRunnablesForAfterRootFrameIsReadyInjectable,
    setupOsThemeUpdatesInjectable,
    setupSentryInjectable,
    setupShellInjectable,
    setupSyncingOfWeblinksInjectable,
    setupSystemCaInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({ run: () => {} }));
  });
};

const overrideOperatingSystem = (di: DiContainer) => {
  di.override(isMacInjectable, () => true);
  di.override(isWindowsInjectable, () => false);
  di.override(isLinuxInjectable, () => false);
  di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
  di.override(joinPathsInjectable, () => joinPathsFake);
};

const overrideElectronFeatures = (di: DiContainer) => {
  di.override(setupMainWindowVisibilityAfterActivationInjectable, () => ({
    run: () => {},
  }));

  di.override(setupDeviceShutdownInjectable, () => ({
    run: () => {},
  }));

  di.override(setupDeepLinkingInjectable, () => ({ run: () => {} }));
  di.override(exitAppInjectable, () => () => {});
  di.override(setupApplicationNameInjectable, () => ({ run: () => {} }));
  di.override(setupRunnablesBeforeClosingOfApplicationInjectable, () => ({ run: () => {} }));
  di.override(getCommandLineSwitchInjectable, () => () => "irrelevant");
  di.override(requestSingleInstanceLockInjectable, () => () => true);
  di.override(disableHardwareAccelerationInjectable, () => () => {});
  di.override(shouldStartHiddenInjectable, () => true);

  di.override(
    getElectronAppPathInjectable,
    () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
  );

  di.override(setElectronAppPathInjectable, () => () => {});
  di.override(isAutoUpdateEnabledInjectable, () => () => false);
  di.override(registerFileProtocolInjectable, () => () => {});
};
