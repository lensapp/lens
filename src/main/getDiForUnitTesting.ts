/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kebabCase, chunk } from "lodash/fp";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { createContainer, isInjectable, getInjectable } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import spawnInjectable from "./child-process/spawn.injectable";
import commandLineArgumentsInjectable from "./utils/command-line-arguments.injectable";
import initializeExtensionsInjectable from "./start-main-application/runnables/initialize-extensions.injectable";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
import setupIpcMainHandlersInjectable from "./electron-app/runnables/setup-ipc-main-handlers/setup-ipc-main-handlers.injectable";
import setupLensProxyInjectable from "./start-main-application/runnables/setup-lens-proxy.injectable";
import setupShellInjectable from "../features/shell-sync/main/setup-shell.injectable";
import setupSyncingOfWeblinksInjectable from "./start-main-application/runnables/setup-syncing-of-weblinks.injectable";
import stopServicesAndExitAppInjectable from "./stop-services-and-exit-app.injectable";
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
import { observable, runInAction } from "mobx";
import waitForElectronToBeReadyInjectable from "./electron-app/features/wait-for-electron-to-be-ready.injectable";
import setupRunnablesAfterWindowIsOpenedInjectable from "./electron-app/runnables/setup-runnables-after-window-is-opened.injectable";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import getElectronThemeInjectable from "./electron-app/features/get-electron-theme.injectable";
import syncThemeFromOperatingSystemInjectable from "./electron-app/features/sync-theme-from-operating-system.injectable";
import platformInjectable from "../common/vars/platform.injectable";
import electronQuitAndInstallUpdateInjectable from "./electron-app/features/electron-quit-and-install-update.injectable";
import electronUpdaterIsActiveInjectable from "./electron-app/features/electron-updater-is-active.injectable";
import baseBundledBinariesDirectoryInjectable from "../common/vars/base-bundled-binaries-dir.injectable";
import setUpdateOnQuitInjectable from "./electron-app/features/set-update-on-quit.injectable";
import startCatalogSyncInjectable from "./catalog-sync-to-renderer/start-catalog-sync.injectable";
import startKubeConfigSyncInjectable from "./start-main-application/runnables/kube-config-sync/start-kube-config-sync.injectable";
import getRandomIdInjectable from "../common/utils/get-random-id.injectable";
import normalizedPlatformArchitectureInjectable from "../common/vars/normalized-platform-architecture.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./start-main-application/lens-window/application-window/wait-until-bundled-extensions-are-loaded.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import electronInjectable from "./utils/resolve-system-proxy/electron.injectable";
import focusApplicationInjectable from "./electron-app/features/focus-application.injectable";
import kubectlDownloadingNormalizedArchInjectable from "./kubectl/normalized-arch.injectable";
import initializeClusterManagerInjectable from "./cluster/initialize-manager.injectable";
import addKubeconfigSyncAsEntitySourceInjectable from "./start-main-application/runnables/kube-config-sync/add-source.injectable";
import type { GlobalOverride } from "../common/test-utils/get-global-override";
import applicationInformationInjectable from "../common/vars/application-information-injectable";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";
import { getOverrideFsWithFakes } from "../test-utils/override-fs-with-fakes";

export function getDiForUnitTesting(opts: { doGeneralOverrides?: boolean } = {}) {
  const {
    doGeneralOverrides = false,
  } = opts;

  const di = createContainer("main");

  di.register(getInjectable({
    id: "node-env",
    instantiate: () => "test",
    injectionToken: nodeEnvInjectionToken,
  }));

  setLegacyGlobalDiForExtensionApi(di, Environments.main);

  di.preventSideEffects();

  const injectables = (
    global.injectablePaths.main.paths
      .map(path => require(path))
      .flatMap(Object.values)
      .filter(isInjectable)
  ) as Injectable<any, any, any>[];

  runInAction(() => {
    registerMobX(di);
    di.register(applicationInformationInjectable);

    chunk(100)(injectables).forEach(chunkInjectables => {
      di.register(...chunkInjectables);
    });
  });

  if (doGeneralOverrides) {
    for (const globalOverridePath of global.injectablePaths.main.globalOverridePaths) {
      const globalOverride = require(globalOverridePath).default as GlobalOverride;

      di.override(globalOverride.injectable, globalOverride.overridingInstantiate);
    }

    di.override(electronInjectable, () => ({}));
    di.override(waitUntilBundledExtensionsAreLoadedInjectable, () => async () => {});
    di.override(getRandomIdInjectable, () => () => "some-irrelevant-random-id");
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");

    overrideOperatingSystem(di);
    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);
    getOverrideFsWithFakes()(di);

    di.override(environmentVariablesInjectable, () => ({}));
    di.override(commandLineArgumentsInjectable, () => []);

    di.override(clusterFramesInjectable, () => observable.map<string, ClusterFrameInfo>());

    di.override(stopServicesAndExitAppInjectable, () => () => {});
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    di.override(broadcastMessageInjectable, () => (channel) => {
      throw new Error(`Tried to broadcast message to channel "${channel}" over IPC without explicit override.`);
    });
    di.override(baseBundledBinariesDirectoryInjectable, () => "some-bin-directory");
    di.override(spawnInjectable, () => () => {
      return {
        stderr: { on: jest.fn(), removeAllListeners: jest.fn() },
        stdout: { on: jest.fn(), removeAllListeners: jest.fn() },
        on: jest.fn(),
      } as never;
    });
  }

  return di;
}

// TODO: Reorganize code in Runnables to get rid of requirement for override
const overrideRunnablesHavingSideEffects = (di: DiContainer) => {
  [
    initializeExtensionsInjectable,
    initializeClusterManagerInjectable,
    addKubeconfigSyncAsEntitySourceInjectable,
    setupIpcMainHandlersInjectable,
    setupLensProxyInjectable,
    setupShellInjectable,
    setupSyncingOfWeblinksInjectable,
    setupSystemCaInjectable,
    setupRunnablesAfterWindowIsOpenedInjectable,
    startCatalogSyncInjectable,
    startKubeConfigSyncInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({
      id: injectable.id,
      run: () => {},
    }));
  });
};

const overrideOperatingSystem = (di: DiContainer) => {
  di.override(platformInjectable, () => "darwin");
  di.override(normalizedPlatformArchitectureInjectable, () => "arm64");
};

const overrideElectronFeatures = (di: DiContainer) => {
  [
    setupMainWindowVisibilityAfterActivationInjectable,
    setupDeviceShutdownInjectable,
    setupDeepLinkingInjectable,
    setupApplicationNameInjectable,
    setupRunnablesBeforeClosingOfApplicationInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({
      id: injectable.id,
      run: () => {},
    }));
  });

  di.override(exitAppInjectable, () => () => {});
  di.override(getCommandLineSwitchInjectable, () => () => "irrelevant");
  di.override(requestSingleInstanceLockInjectable, () => () => true);
  di.override(disableHardwareAccelerationInjectable, () => () => {});
  di.override(shouldStartHiddenInjectable, () => false);
  di.override(showMessagePopupInjectable, () => () => {});
  di.override(waitForElectronToBeReadyInjectable, () => () => Promise.resolve());
  di.override(getElectronThemeInjectable, () => () => "dark");
  di.override(syncThemeFromOperatingSystemInjectable, () => ({ start: () => {}, stop: () => {} }));
  di.override(electronQuitAndInstallUpdateInjectable, () => () => {});
  di.override(setUpdateOnQuitInjectable, () => () => {});
  di.override(focusApplicationInjectable, () => () => {});

  di.override(
    getElectronAppPathInjectable,
    () => (name: string) => `/some-electron-app-path-for-${kebabCase(name)}`,
  );

  di.override(setElectronAppPathInjectable, () => () => {});
  di.override(electronUpdaterIsActiveInjectable, () => false);
};
