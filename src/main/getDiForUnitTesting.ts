/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kebabCase, noop, chunk } from "lodash/fp";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import appNameInjectable from "./app-paths/app-name/app-name.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import loggerInjectable from "../common/logger.injectable";
import spawnInjectable from "./child-process/spawn.injectable";
import extensionsStoreInjectable from "../extensions/extensions-store/extensions-store.injectable";
import type { ExtensionsStore } from "../extensions/extensions-store/extensions-store";
import fileSystemProvisionerStoreInjectable from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store";
import userStoreInjectable from "../common/user-store/user-store.injectable";
import type { UserStore } from "../common/user-store";
import getAbsolutePathInjectable from "../common/path/get-absolute-path.injectable";
import { getAbsolutePathFake } from "../common/test-utils/get-absolute-path-fake";
import joinPathsInjectable from "../common/path/join-paths.injectable";
import { joinPathsFake } from "../common/test-utils/join-paths-fake";
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import { EventEmitter } from "../common/event-emitter";
import type { AppEvent } from "../common/app-event-bus/event-bus";
import commandLineArgumentsInjectable from "./utils/command-line-arguments.injectable";
import initializeExtensionsInjectable from "./start-main-application/runnables/initialize-extensions.injectable";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
import setupIpcMainHandlersInjectable from "./electron-app/runnables/setup-ipc-main-handlers/setup-ipc-main-handlers.injectable";
import setupLensProxyInjectable from "./start-main-application/runnables/setup-lens-proxy.injectable";
import setupSentryInjectable from "./start-main-application/runnables/setup-sentry.injectable";
import setupShellInjectable from "./start-main-application/runnables/setup-shell.injectable";
import setupSyncingOfWeblinksInjectable from "./start-main-application/runnables/setup-syncing-of-weblinks.injectable";
import stopServicesAndExitAppInjectable from "./stop-services-and-exit-app.injectable";
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
import ipcMainInjectable from "./utils/channel/ipc-main/ipc-main.injectable";
import setupRunnablesAfterWindowIsOpenedInjectable from "./electron-app/runnables/setup-runnables-after-window-is-opened.injectable";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import getElectronThemeInjectable from "./electron-app/features/get-electron-theme.injectable";
import syncThemeFromOperatingSystemInjectable from "./electron-app/features/sync-theme-from-operating-system.injectable";
import platformInjectable from "../common/vars/platform.injectable";
import productNameInjectable from "./app-paths/app-name/product-name.injectable";
import electronQuitAndInstallUpdateInjectable from "./electron-app/features/electron-quit-and-install-update.injectable";
import electronUpdaterIsActiveInjectable from "./electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "./application-update/publish-is-configured.injectable";
import checkForPlatformUpdatesInjectable from "./application-update/check-for-platform-updates/check-for-platform-updates.injectable";
import baseBundledBinariesDirectoryInjectable from "../common/vars/base-bundled-binaries-dir.injectable";
import setUpdateOnQuitInjectable from "./electron-app/features/set-update-on-quit.injectable";
import downloadPlatformUpdateInjectable from "./application-update/download-platform-update/download-platform-update.injectable";
import startCatalogSyncInjectable from "./catalog-sync-to-renderer/start-catalog-sync.injectable";
import startKubeConfigSyncInjectable from "./start-main-application/runnables/kube-config-sync/start-kube-config-sync.injectable";
import appVersionInjectable from "../common/vars/app-version.injectable";
import getRandomIdInjectable from "../common/utils/get-random-id.injectable";
import periodicalCheckForUpdatesInjectable from "./application-update/periodical-check-for-updates/periodical-check-for-updates.injectable";
import execFileInjectable from "../common/fs/exec-file.injectable";
import normalizedPlatformArchitectureInjectable from "../common/vars/normalized-platform-architecture.injectable";
import getHelmChartInjectable from "./helm/helm-service/get-helm-chart.injectable";
import getHelmChartValuesInjectable from "./helm/helm-service/get-helm-chart-values.injectable";
import listHelmChartsInjectable from "./helm/helm-service/list-helm-charts.injectable";
import deleteHelmReleaseInjectable from "./helm/helm-service/delete-helm-release.injectable";
import getHelmReleaseHistoryInjectable from "./helm/helm-service/get-helm-release-history.injectable";
import getHelmReleaseInjectable from "./helm/helm-service/get-helm-release.injectable";
import getHelmReleaseValuesInjectable from "./helm/helm-service/get-helm-release-values.injectable";
import installHelmChartInjectable from "./helm/helm-service/install-helm-chart.injectable";
import listHelmReleasesInjectable from "./helm/helm-service/list-helm-releases.injectable";
import rollbackHelmReleaseInjectable from "./helm/helm-service/rollback-helm-release.injectable";
import updateHelmReleaseInjectable from "./helm/helm-service/update-helm-release.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./start-main-application/lens-window/application-window/wait-until-bundled-extensions-are-loaded.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import electronInjectable from "./utils/resolve-system-proxy/electron.injectable";
import type { HotbarStore } from "../common/hotbars/store";
import focusApplicationInjectable from "./electron-app/features/focus-application.injectable";
import type { GlobalOverride } from "../common/test-utils/get-global-override";

export function getDiForUnitTesting(opts: { doGeneralOverrides?: boolean } = {}) {
  const {
    doGeneralOverrides = false,
  } = opts;

  const di = createContainer("main");

  registerMobX(di);

  setLegacyGlobalDiForExtensionApi(di, Environments.main);

  const injectables: Injectable<any, any, any>[] = (global as any).mainInjectablePaths.map(
    (filePath: string) => require(filePath).default,
  );

  chunk(100)(injectables).forEach(chunkInjectables => {
    di.register(...chunkInjectables);
  });

  di.preventSideEffects();

  if (doGeneralOverrides) {
    const globalOverrides: GlobalOverride[] = (global as any).mainGlobalOverridePaths.map(
      (filePath: string) => require(filePath).default,
    );

    globalOverrides.forEach(globalOverride => {
      di.override(globalOverride.injectable, globalOverride.overridingInstantiate);
    });

    di.override(electronInjectable, () => ({}));
    di.override(waitUntilBundledExtensionsAreLoadedInjectable, () => async () => {});
    di.override(getRandomIdInjectable, () => () => "some-irrelevant-random-id");

    di.override(hotbarStoreInjectable, () => ({
      load: () => {},
      getActive: () => ({ name: "some-hotbar", items: [] }),
      getDisplayIndex: () => "0",
    }) as unknown as HotbarStore);

    di.override(userStoreInjectable, () => ({ startMainReactions: () => {}, extensionRegistryUrl: { customUrl: "some-custom-url" }}) as UserStore);
    di.override(extensionsStoreInjectable, () => ({ isEnabled: (opts) => (void opts, false) }) as ExtensionsStore);
    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    overrideOperatingSystem(di);
    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);

    di.override(isDevelopmentInjectable, () => false);
    di.override(environmentVariablesInjectable, () => ({}));
    di.override(commandLineArgumentsInjectable, () => []);

    di.override(productNameInjectable, () => "some-product-name");
    di.override(appVersionInjectable, () => "1.0.0");

    di.override(clusterFramesInjectable, () => observable.map<string, ClusterFrameInfo>());

    di.override(stopServicesAndExitAppInjectable, () => () => {});
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    di.override(applicationMenuInjectable, () => ({ start: () => {}, stop: () => {} }));

    di.override(periodicalCheckForUpdatesInjectable, () => ({ start: () => {}, stop: () => {}, started: false }));

    overrideFunctionalInjectables(di, [
      getHelmChartInjectable,
      getHelmChartValuesInjectable,
      listHelmChartsInjectable,
      deleteHelmReleaseInjectable,
      getHelmReleaseHistoryInjectable,
      getHelmReleaseInjectable,
      getHelmReleaseValuesInjectable,
      installHelmChartInjectable,
      listHelmReleasesInjectable,
      rollbackHelmReleaseInjectable,
      updateHelmReleaseInjectable,
      writeJsonFileInjectable,
      readJsonFileInjectable,
      readFileInjectable,
      execFileInjectable,
    ]);

    // TODO: Remove usages of globally exported appEventBus to get rid of this
    di.override(appEventBusInjectable, () => new EventEmitter<[AppEvent]>());

    di.override(appNameInjectable, () => "some-app-name");
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

// TODO: Reorganize code in Runnables to get rid of requirement for override
const overrideRunnablesHavingSideEffects = (di: DiContainer) => {
  [
    initializeExtensionsInjectable,
    setupIpcMainHandlersInjectable,
    setupLensProxyInjectable,
    setupSentryInjectable,
    setupShellInjectable,
    setupSyncingOfWeblinksInjectable,
    setupSystemCaInjectable,
    setupListenerForCurrentClusterFrameInjectable,
    setupRunnablesAfterWindowIsOpenedInjectable,
    startCatalogSyncInjectable,
    startKubeConfigSyncInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({ run: () => {} }));
  });
};

const overrideOperatingSystem = (di: DiContainer) => {
  di.override(platformInjectable, () => "darwin");
  di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
  di.override(joinPathsInjectable, () => joinPathsFake);
  di.override(normalizedPlatformArchitectureInjectable, () => "arm64");
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
  di.override(shouldStartHiddenInjectable, () => false);
  di.override(showMessagePopupInjectable, () => () => {});
  di.override(waitForElectronToBeReadyInjectable, () => () => Promise.resolve());
  di.override(ipcMainInjectable, () => ({}));
  di.override(getElectronThemeInjectable, () => () => "dark");
  di.override(syncThemeFromOperatingSystemInjectable, () => ({ start: () => {}, stop: () => {} }));
  di.override(electronQuitAndInstallUpdateInjectable, () => () => {});
  di.override(setUpdateOnQuitInjectable, () => () => {});
  di.override(downloadPlatformUpdateInjectable, () => async () => ({ downloadWasSuccessful: true }));
  di.override(focusApplicationInjectable, () => () => {});

  di.override(checkForPlatformUpdatesInjectable, () => () => {
    throw new Error("Tried to check for platform updates without explicit override.");
  });

  di.override(
    getElectronAppPathInjectable,
    () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
  );

  di.override(setElectronAppPathInjectable, () => () => {});
  di.override(publishIsConfiguredInjectable, () => false);
  di.override(electronUpdaterIsActiveInjectable, () => false);
};

const overrideFunctionalInjectables = (di: DiContainer, injectables: Injectable<any, any, any>[]) => {
  injectables.forEach(injectable => {
    di.override(injectable, () => () => {
      throw new Error(`Tried to run "${injectable.id}" without explicit override.`);
    });
  });
};
