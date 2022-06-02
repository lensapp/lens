/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { kebabCase, memoize } from "lodash/fp";
import type { DiContainer } from "@ogre-tools/injectable";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import appNameInjectable from "./app-paths/app-name/app-name.injectable";
import registerChannelInjectable from "./app-paths/register-channel/register-channel.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
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
import type { UserStore } from "../common/user-store";
import getAbsolutePathInjectable from "../common/path/get-absolute-path.injectable";
import { getAbsolutePathFake } from "../common/test-utils/get-absolute-path-fake";
import joinPathsInjectable from "../common/path/join-paths.injectable";
import { joinPathsFake } from "../common/test-utils/join-paths-fake";
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import type { GetDiForUnitTestingOptions } from "../test-utils/get-dis-for-unit-testing";
import isAutoUpdateEnabledInjectable from "./is-auto-update-enabled.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import { EventEmitter } from "../common/event-emitter";
import type { AppEvent } from "../common/app-event-bus/event-bus";
import commandLineArgumentsInjectable from "./utils/command-line-arguments.injectable";
import initializeExtensionsInjectable from "./start-main-application/runnables/initialize-extensions.injectable";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
import setupIpcMainHandlersInjectable from "./electron-app/runnables/setup-ipc-main-handlers/setup-ipc-main-handlers.injectable";
import setupLensProxyInjectable from "./start-main-application/runnables/setup-lens-proxy.injectable";
import setupRunnablesForAfterRootFrameIsReadyInjectable from "./start-main-application/runnables/setup-runnables-for-after-root-frame-is-ready.injectable";
import setupSentryInjectable from "./start-main-application/runnables/setup-sentry.injectable";
import setupShellInjectable from "./start-main-application/runnables/setup-shell.injectable";
import setupSyncingOfWeblinksInjectable from "./start-main-application/runnables/setup-syncing-of-weblinks.injectable";
import stopServicesAndExitAppInjectable from "./stop-services-and-exit-app.injectable";
import trayInjectable from "./tray/tray.injectable";
import applicationMenuInjectable from "./menu/application-menu.injectable";
import isDevelopmentInjectable from "../common/vars/is-development.injectable";
import setupSystemCaInjectable from "./start-main-application/runnables/setup-system-ca.injectable";
import setupDeepLinkingInjectable from "./electron-app/runnables/setup-deep-linking.injectable";
import exitAppInjectable from "./electron-app/features/exit-app.injectable";
import getCommandLineSwitchInjectable from "./electron-app/features/get-command-line-switch.injectable";
import requestSingleInstanceLockInjectable from "./electron-app/features/request-single-instance-lock.injectable";
import disableHardwareAccelerationInjectable from "./electron-app/features/disable-hardware-acceleration.injectable";
import shouldStartHiddenInjectable from "./electron-app/features/should-start-hidden.injectable";
import getElectronAppPathInjectable from "./app-paths/get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./app-paths/set-electron-app-path/set-electron-app-path.injectable";
import setupMainWindowVisibilityAfterActivationInjectable from "./electron-app/runnables/setup-main-window-visibility-after-activation.injectable";
import setupDeviceShutdownInjectable from "./electron-app/runnables/setup-device-shutdown.injectable";
import setupApplicationNameInjectable from "./electron-app/runnables/setup-application-name.injectable";
import setupRunnablesBeforeClosingOfApplicationInjectable from "./electron-app/runnables/setup-runnables-before-closing-of-application.injectable";
import showMessagePopupInjectable from "./electron-app/features/show-message-popup.injectable";
import clusterFramesInjectable from "../common/cluster-frames.injectable";
import type { ClusterFrameInfo } from "../common/cluster-frames";
import { observable } from "mobx";
import waitForElectronToBeReadyInjectable from "./electron-app/features/wait-for-electron-to-be-ready.injectable";
import setupListenerForCurrentClusterFrameInjectable from "./start-main-application/lens-window/current-cluster-frame/setup-listener-for-current-cluster-frame.injectable";
import ipcMainInjectable from "./app-paths/register-channel/ipc-main/ipc-main.injectable";
import createElectronWindowForInjectable from "./start-main-application/lens-window/application-window/create-electron-window-for.injectable";
import setupRunnablesAfterWindowIsOpenedInjectable from "./electron-app/runnables/setup-runnables-after-window-is-opened.injectable";
import sendToChannelInElectronBrowserWindowInjectable from "./start-main-application/lens-window/application-window/send-to-channel-in-electron-browser-window.injectable";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import getElectronThemeInjectable from "./electron-app/features/get-electron-theme.injectable";
import syncThemeFromOperatingSystemInjectable from "./electron-app/features/sync-theme-from-operating-system.injectable";
import platformInjectable from "../common/vars/platform.injectable";
import { noop } from "../renderer/utils";
import baseBundeledBinariesDirectoryInjectable from "../common/vars/base-bundled-binaries-dir.injectable";

export function getDiForUnitTesting(opts: GetDiForUnitTestingOptions = {}) {
  const {
    doGeneralOverrides = false,
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

  if (doGeneralOverrides) {
    di.override(hotbarStoreInjectable, () => ({ load: () => {} }));
    di.override(userStoreInjectable, () => ({ startMainReactions: () => {} }) as UserStore);
    di.override(extensionsStoreInjectable, () => ({ isEnabled: (opts) => (void opts, false) }) as ExtensionsStore);
    di.override(clusterStoreInjectable, () => ({ getById: (id) => (void id, {}) as Cluster }) as ClusterStore);
    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    overrideOperatingSystem(di);
    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);

    di.override(isDevelopmentInjectable, () => false);
    di.override(environmentVariablesInjectable, () => ({}));
    di.override(commandLineArgumentsInjectable, () => []);

    di.override(clusterFramesInjectable, () => observable.map<string, ClusterFrameInfo>());

    di.override(stopServicesAndExitAppInjectable, () => () => {});
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    di.override(trayInjectable, () => ({ start: () => {}, stop: () => {} }));
    di.override(applicationMenuInjectable, () => ({ start: () => {}, stop: () => {} }));

    // TODO: Remove usages of globally exported appEventBus to get rid of this
    di.override(appEventBusInjectable, () => new EventEmitter<[AppEvent]>());

    di.override(appNameInjectable, () => "some-app-name");
    di.override(registerChannelInjectable, () => () => undefined);
    di.override(broadcastMessageInjectable, () => (channel) => {
      throw new Error(`Tried to broadcast message to channel "${channel}" over IPC without explicit override.`);
    });
    di.override(baseBundeledBinariesDirectoryInjectable, () => "some-bin-directory");
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
      warn: noop,
      debug: noop,
      error: noop,
      info: noop,
      silly: noop,
    }));
  }

  return di;
}

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
    setupSentryInjectable,
    setupShellInjectable,
    setupSyncingOfWeblinksInjectable,
    setupSystemCaInjectable,
    setupListenerForCurrentClusterFrameInjectable,
    setupRunnablesAfterWindowIsOpenedInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({ run: () => {} }));
  });
};

const overrideOperatingSystem = (di: DiContainer) => {
  di.override(platformInjectable, () => "darwin");
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
  di.override(showMessagePopupInjectable, () => () => {});
  di.override(waitForElectronToBeReadyInjectable, () => () => Promise.resolve());
  di.override(ipcMainInjectable, () => ({}));
  di.override(getElectronThemeInjectable, () => () => "dark");
  di.override(syncThemeFromOperatingSystemInjectable, () => ({ start: () => {}, stop: () => {} }));

  di.override(createElectronWindowForInjectable, () => () => async () => ({
    show: () => {},

    close: () => {},

    send: (arg) => {
      const sendFake = di.inject(sendToChannelInElectronBrowserWindowInjectable) as any;

      sendFake(null, arg);
    },
  }));

  di.override(
    getElectronAppPathInjectable,
    () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
  );

  di.override(setElectronAppPathInjectable, () => () => {});
  di.override(isAutoUpdateEnabledInjectable, () => () => false);
};
