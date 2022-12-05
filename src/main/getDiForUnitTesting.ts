/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { kebabCase, noop, chunk } from "lodash/fp";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { createContainer, isInjectable } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import loggerInjectable from "../common/logger.injectable";
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
import execFileInjectable from "../common/fs/exec-file.injectable";
import normalizedPlatformArchitectureInjectable from "../common/vars/normalized-platform-architecture.injectable";
import getHelmChartVersionsInjectable from "./helm/helm-service/get-helm-chart-versions.injectable";
import getHelmChartValuesInjectable from "./helm/helm-service/get-helm-chart-values.injectable";
import listHelmChartsInjectable from "./helm/helm-service/list-helm-charts.injectable";
import deleteHelmReleaseInjectable from "./helm/helm-service/delete-helm-release.injectable";
import getHelmReleaseHistoryInjectable from "./helm/helm-service/get-helm-release-history.injectable";
import getHelmReleaseValuesInjectable from "./helm/helm-service/get-helm-release-values.injectable";
import installHelmChartInjectable from "./helm/helm-service/install-helm-chart.injectable";
import listHelmReleasesInjectable from "./helm/helm-service/list-helm-releases.injectable";
import rollbackHelmReleaseInjectable from "./helm/helm-service/rollback-helm-release.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./start-main-application/lens-window/application-window/wait-until-bundled-extensions-are-loaded.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import electronInjectable from "./utils/resolve-system-proxy/electron.injectable";
import focusApplicationInjectable from "./electron-app/features/focus-application.injectable";
import kubectlDownloadingNormalizedArchInjectable from "./kubectl/normalized-arch.injectable";
import initializeClusterManagerInjectable from "./cluster/initialize-manager.injectable";
import addKubeconfigSyncAsEntitySourceInjectable from "./start-main-application/runnables/kube-config-sync/add-source.injectable";
import type { GlobalOverride } from "../common/test-utils/get-global-override";

export function getDiForUnitTesting(opts: { doGeneralOverrides?: boolean } = {}) {
  const {
    doGeneralOverrides = false,
  } = opts;

  const di = createContainer("main");

  setLegacyGlobalDiForExtensionApi(di, Environments.main);

  di.preventSideEffects();

  const injectables: Injectable<any, any, any>[] = (
    global as any
  ).mainInjectablePaths.flatMap((filePath: string) =>
    Object.values(require(filePath)).filter(
      (maybeInjectable: any) => isInjectable(maybeInjectable),
    ),
  );

  runInAction(() => {
    registerMobX(di);

    chunk(100)(injectables).forEach(chunkInjectables => {
      di.register(...chunkInjectables);
    });
  });

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
    di.override(kubectlDownloadingNormalizedArchInjectable, () => "amd64");

    overrideOperatingSystem(di);
    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);

    di.override(isDevelopmentInjectable, () => false);
    di.override(environmentVariablesInjectable, () => ({}));
    di.override(commandLineArgumentsInjectable, () => []);

    di.override(clusterFramesInjectable, () => observable.map<string, ClusterFrameInfo>());

    di.override(stopServicesAndExitAppInjectable, () => () => {});
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    overrideFunctionalInjectables(di, [
      getHelmChartVersionsInjectable,
      getHelmChartValuesInjectable,
      listHelmChartsInjectable,
      deleteHelmReleaseInjectable,
      getHelmReleaseHistoryInjectable,
      getHelmReleaseValuesInjectable,
      installHelmChartInjectable,
      listHelmReleasesInjectable,
      rollbackHelmReleaseInjectable,
      writeJsonFileInjectable,
      readJsonFileInjectable,
      readFileInjectable,
      execFileInjectable,
    ]);

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

const overrideFunctionalInjectables = (di: DiContainer, injectables: Injectable<any, any, any>[]) => {
  injectables.forEach(injectable => {
    di.override(injectable, () => () => {
      throw new Error(`Tried to run "${injectable.id}" without explicit override.`);
    });
  });
};
