/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize, noop, chunk } from "lodash/fp";
import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import {
  createContainer,
} from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import requestFromChannelInjectable from "./utils/channel/request-from-channel.injectable";
import loggerInjectable from "../common/logger.injectable";
import { overrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import { createMemoryHistory } from "history";
import focusWindowInjectable from "./navigation/focus-window.injectable";
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
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "./cluster-frame-context/hosted-cluster-id.injectable";
import historyInjectable from "./navigation/history.injectable";
import { ApiManager } from "../common/k8s-api/api-manager";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import apiManagerInjectable from "../common/k8s-api/api-manager/manager.injectable";
import ipcRendererInjectable from "./utils/channel/ipc-renderer.injectable";
import type { IpcRenderer } from "electron";
import setupOnApiErrorListenersInjectable from "./api/setup-on-api-errors.injectable";
import { observable, computed } from "mobx";
import defaultShellInjectable from "./components/+preferences/default-shell.injectable";
import appVersionInjectable from "../common/get-configuration-file-model/app-version/app-version.injectable";
import provideInitialValuesForSyncBoxesInjectable from "./utils/sync-box/provide-initial-values-for-sync-boxes.injectable";
import requestAnimationFrameInjectable from "./components/animate/request-animation-frame.injectable";
import getRandomIdInjectable from "../common/utils/get-random-id.injectable";
import getFilePathsInjectable from "./components/+preferences/kubernetes/helm-charts/adding-of-custom-helm-repository/helm-file-input/get-file-paths.injectable";
import callForPublicHelmRepositoriesInjectable from "./components/+preferences/kubernetes/helm-charts/adding-of-public-helm-repository/public-helm-repositories/call-for-public-helm-repositories.injectable";
import platformInjectable from "../common/vars/platform.injectable";
import startTopbarStateSyncInjectable from "./components/layout/top-bar/start-state-sync.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import watchHistoryStateInjectable from "./remote-helpers/watch-history-state.injectable";
import openAppContextMenuInjectable from "./components/layout/top-bar/open-app-context-menu.injectable";
import goBackInjectable from "./components/layout/top-bar/go-back.injectable";
import goForwardInjectable from "./components/layout/top-bar/go-forward.injectable";
import closeWindowInjectable from "./components/layout/top-bar/close-window.injectable";
import maximizeWindowInjectable from "./components/layout/top-bar/maximize-window.injectable";
import toggleMaximizeWindowInjectable from "./components/layout/top-bar/toggle-maximize-window.injectable";
import type { HotbarStore } from "../common/hotbars/store";
import cronJobTriggerDialogClusterFrameChildComponentInjectable from "./components/+workloads-cronjobs/cron-job-trigger-dialog-cluster-frame-child-component.injectable";
import deploymentScaleDialogClusterFrameChildComponentInjectable from "./components/+workloads-deployments/scale/deployment-scale-dialog-cluster-frame-child-component.injectable";
import replicasetScaleDialogClusterFrameChildComponentInjectable from "./components/+workloads-replicasets/scale-dialog/replicaset-scale-dialog-cluster-frame-child-component.injectable";
import statefulsetScaleDialogClusterFrameChildComponentInjectable from "./components/+workloads-statefulsets/scale/statefulset-scale-dialog-cluster-frame-child-component.injectable";
import deleteClusterDialogClusterFrameChildComponentInjectable from "./components/delete-cluster-dialog/delete-cluster-dialog-cluster-frame-child-component.injectable";
import kubeObjectDetailsClusterFrameChildComponentInjectable from "./components/kube-object-details/kube-object-details-cluster-frame-child-component.injectable";
import kubeconfigDialogClusterFrameChildComponentInjectable from "./components/kubeconfig-dialog/kubeconfig-dialog-cluster-frame-child-component.injectable";
import portForwardDialogClusterFrameChildComponentInjectable from "./port-forward/port-forward-dialog-cluster-frame-child-component.injectable";
import setupSystemCaInjectable from "./frames/root-frame/setup-system-ca.injectable";
import extensionShouldBeEnabledForClusterFrameInjectable from "./extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import forceUpdateModalRootFrameComponentInjectable from "./application-update/force-update-modal/force-update-modal-root-frame-component.injectable";
import legacyOnChannelListenInjectable from "./ipc/legacy-channel-listen.injectable";
import getEntitySettingCommandsInjectable from "./components/command-palette/registered-commands/get-entity-setting-commands.injectable";
import storageSaveDelayInjectable from "./utils/create-storage/storage-save-delay.injectable";

export const getDiForUnitTesting = (opts: { doGeneralOverrides?: boolean } = {}) => {
  const {
    doGeneralOverrides = false,
  } = opts;

  const di = createContainer("renderer");

  registerMobX(di);

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  const filePaths = getInjectableFilePaths();

  const injectables = filePaths.map(filePath => require(filePath).default);

  chunk(100)(injectables).forEach(chunkInjectables => {
    di.register(...chunkInjectables);
  });

  di.preventSideEffects();

  if (doGeneralOverrides) {
    di.override(getRandomIdInjectable, () => () => "some-irrelevant-random-id");
    di.override(platformInjectable, () => "darwin");
    di.override(startTopbarStateSyncInjectable, () => ({
      run: () => {},
    }));

    di.override(terminalSpawningPoolInjectable, () => document.createElement("div"));
    di.override(hostedClusterIdInjectable, () => undefined);

    di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
    di.override(joinPathsInjectable, () => joinPathsFake);

    di.override(appVersionInjectable, () => "1.0.0");

    di.override(historyInjectable, () => createMemoryHistory());
    di.override(legacyOnChannelListenInjectable, () => () => noop);

    di.override(storageSaveDelayInjectable, () => 0);

    di.override(requestAnimationFrameInjectable, () => (callback) => callback());
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    // TODO: remove when entity settings registry is refactored
    di.override(getEntitySettingCommandsInjectable, () => () => []);

    di.override(forceUpdateModalRootFrameComponentInjectable, () => ({
      id: "force-update-modal",
      Component: () => null,
      shouldRender: computed(() => false),
    }));

    // TODO: Remove after "LensRendererExtension.isEnabledForCluster" is removed
    di.override(extensionShouldBeEnabledForClusterFrameInjectable, () =>
      asyncComputed(async () => true, true),
    );

    // TODO: Remove side-effects and shared global state
    const clusterFrameChildComponentInjectables: Injectable<any, any, any>[] = [
      cronJobTriggerDialogClusterFrameChildComponentInjectable,
      deploymentScaleDialogClusterFrameChildComponentInjectable,
      replicasetScaleDialogClusterFrameChildComponentInjectable,
      statefulsetScaleDialogClusterFrameChildComponentInjectable,
      deleteClusterDialogClusterFrameChildComponentInjectable,
      kubeObjectDetailsClusterFrameChildComponentInjectable,
      kubeconfigDialogClusterFrameChildComponentInjectable,
      portForwardDialogClusterFrameChildComponentInjectable,
    ];

    clusterFrameChildComponentInjectables.forEach((injectable) => {
      di.override(injectable, () => ({
        Component: () => null,
        id: injectable.id,
        shouldRender: computed(() => false),
      }));
    });

    di.override(watchHistoryStateInjectable, () => () => () => {});
    di.override(openAppContextMenuInjectable, () => () => {});
    di.override(goBackInjectable, () => () => {});
    di.override(goForwardInjectable, () => () => {});
    di.override(closeWindowInjectable, () => () => {});
    di.override(maximizeWindowInjectable, () => () => {});
    di.override(toggleMaximizeWindowInjectable, () => () => {});

    di.override(ipcRendererInjectable, () => ({
      invoke: () => {},
      on: () => {},
    }) as unknown as IpcRenderer);

    overrideFunctionalInjectables(di, [
      broadcastMessageInjectable,
      getFilePathsInjectable,
      callForPublicHelmRepositoriesInjectable,
    ]);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(hotbarStoreInjectable, () => ({
      getActive: () => ({ name: "some-hotbar", items: [] }),
      getDisplayIndex: () => "0",
    }) as unknown as HotbarStore);

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);

    di.override(setupSystemCaInjectable, () => ({ run: () => {} }));
    di.override(setupOnApiErrorListenersInjectable, () => ({ run: () => {} }));
    di.override(provideInitialValuesForSyncBoxesInjectable, () => ({ run: () => {} }));

    di.override(defaultShellInjectable, () => "some-default-shell");

    di.override(
      userStoreInjectable,
      () =>
        ({
          isTableColumnHidden: () => false,
          extensionRegistryUrl: { customUrl: "some-custom-url" },
          syncKubeconfigEntries: observable.map(),
          terminalConfig: { fontSize: 42 },
          editorConfiguration: { minimap: {}, tabSize: 42, fontSize: 42 },
        } as unknown as UserStore),
    );

    di.override(apiManagerInjectable, () => new ApiManager());

    di.override(requestFromChannelInjectable, () => () => Promise.resolve(undefined as never));

    overrideFsWithFakes(di);

    di.override(focusWindowInjectable, () => () => {});

    di.override(loggerInjectable, () => ({
      warn: noop,
      debug: noop,
      error: noop,
      info: noop,
      silly: noop,
    }));
  }

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);

const overrideFunctionalInjectables = (di: DiContainer, injectables: Injectable<any, any, any>[]) => {
  injectables.forEach(injectable => {
    di.override(injectable, () => () => {
      throw new Error(`Tried to run "${injectable.id}" without explicit override.`);
    });
  });
};
