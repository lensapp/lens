/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize, noop } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import getValueFromRegisteredChannelInjectable from "./app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import loggerInjectable from "../common/logger.injectable";
import { overrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import { createMemoryHistory } from "history";
import registerIpcChannelListenerInjectable from "./app-paths/get-value-from-registered-channel/register-ipc-channel-listener.injectable";
import focusWindowInjectable from "./ipc-channel-listeners/focus-window.injectable";
import extensionsStoreInjectable from "../extensions/extensions-store/extensions-store.injectable";
import type { ExtensionsStore } from "../extensions/extensions-store/extensions-store";
import fileSystemProvisionerStoreInjectable from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { FileSystemProvisionerStore } from "../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store";
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
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "../common/cluster-store/hosted-cluster-id.injectable";
import type { GetDiForUnitTestingOptions } from "../test-utils/get-dis-for-unit-testing";
import historyInjectable from "./navigation/history.injectable";
import { ApiManager } from "../common/k8s-api/api-manager";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import broadcastMessageInjectable from "../common/ipc/broadcast-message.injectable";
import apiManagerInjectable from "../common/k8s-api/api-manager/manager.injectable";
import ipcRendererInjectable
  from "./app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import type { IpcRenderer } from "electron";
import setupOnApiErrorListenersInjectable from "./api/setup-on-api-errors.injectable";
import { observable } from "mobx";

export const getDiForUnitTesting = (opts: GetDiForUnitTestingOptions = {}) => {
  const {
    doGeneralOverrides = false,
  } = opts;

  const di = createContainer();

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  for (const filePath of getInjectableFilePaths()) {
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

    di.override(terminalSpawningPoolInjectable, () => document.createElement("div"));
    di.override(hostedClusterIdInjectable, () => undefined);

    di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
    di.override(joinPathsInjectable, () => joinPathsFake);

    di.override(historyInjectable, () => createMemoryHistory());

    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    di.override(ipcRendererInjectable, () => ({
      invoke: () => {},
      on: () => {},
    }) as unknown as IpcRenderer);

    di.override(broadcastMessageInjectable, () => () => {
      throw new Error("Tried to broadcast message over IPC without explicit override.");
    });

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(hotbarStoreInjectable, () => ({}));

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);

    di.override(setupOnApiErrorListenersInjectable, () => ({ run: () => {} }));

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

    di.override(getValueFromRegisteredChannelInjectable, () => () => Promise.resolve(undefined as never));
    di.override(registerIpcChannelListenerInjectable, () => () => undefined);

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
