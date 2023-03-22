/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { chunk } from "lodash/fp";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import { createContainer, isInjectable, getInjectable } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import spawnInjectable from "./child-process/spawn.injectable";
import initializeExtensionsInjectable from "./start-main-application/runnables/initialize-extensions.injectable";
import setupIpcMainHandlersInjectable from "./electron-app/runnables/setup-ipc-main-handlers/setup-ipc-main-handlers.injectable";
import setupLensProxyInjectable from "./start-main-application/runnables/setup-lens-proxy.injectable";
import setupSyncingOfWeblinksInjectable from "./start-main-application/runnables/setup-syncing-of-weblinks.injectable";
import setupDeepLinkingInjectable from "./electron-app/runnables/setup-deep-linking.injectable";
import setupMainWindowVisibilityAfterActivationInjectable from "./electron-app/runnables/setup-main-window-visibility-after-activation.injectable";
import setupDeviceShutdownInjectable from "./electron-app/runnables/setup-device-shutdown.injectable";
import setupApplicationNameInjectable from "./electron-app/runnables/setup-application-name.injectable";
import setupRunnablesBeforeClosingOfApplicationInjectable from "./electron-app/runnables/setup-runnables-before-closing-of-application.injectable";
import clusterFramesInjectable from "../common/cluster-frames.injectable";
import type { ClusterFrameInfo } from "../common/cluster-frames";
import { observable, runInAction } from "mobx";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import electronQuitAndInstallUpdateInjectable from "./electron-app/features/electron-quit-and-install-update.injectable";
import electronUpdaterIsActiveInjectable from "./electron-app/features/electron-updater-is-active.injectable";
import setUpdateOnQuitInjectable from "./electron-app/features/set-update-on-quit.injectable";
import waitUntilBundledExtensionsAreLoadedInjectable from "./start-main-application/lens-window/application-window/wait-until-bundled-extensions-are-loaded.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import initializeClusterManagerInjectable from "./cluster/initialize-manager.injectable";
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
    instantiate: () => "production",
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

    di.override(waitUntilBundledExtensionsAreLoadedInjectable, () => async () => {});

    overrideRunnablesHavingSideEffects(di);
    overrideElectronFeatures(di);
    getOverrideFsWithFakes()(di);

    di.override(clusterFramesInjectable, () => observable.map<string, ClusterFrameInfo>());

    di.override(broadcastMessageInjectable, () => (channel) => {
      throw new Error(`Tried to broadcast message to channel "${channel}" over IPC without explicit override.`);
    });
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
    setupIpcMainHandlersInjectable,
    setupLensProxyInjectable,
    setupSyncingOfWeblinksInjectable,
  ].forEach((injectable) => {
    di.override(injectable, () => ({
      id: injectable.id,
      run: () => {},
    }));
  });
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

  di.override(electronQuitAndInstallUpdateInjectable, () => () => {});
  di.override(setUpdateOnQuitInjectable, () => () => {});
  di.override(electronUpdaterIsActiveInjectable, () => false);
};
