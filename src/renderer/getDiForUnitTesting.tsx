/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { isEqual, isPlainObject, memoize } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import getValueFromRegisteredChannelInjectable from "./app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import loggerInjectable from "../common/logger.injectable";
import { overrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import observableHistoryInjectable from "./navigation/observable-history.injectable";
import { searchParamsOptions } from "./navigation";
import { createMemoryHistory } from "history";
import { createObservableHistory } from "mobx-observable-history";
import registerIpcChannelListenerInjectable from "./app-paths/get-value-from-registered-channel/register-ipc-channel-listener.injectable";
import focusWindowInjectable from "./ipc-channel-listeners/focus-window.injectable";
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
import hotbarStoreInjectable from "../common/hotbars/store.injectable";
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "../common/cluster-store/hosted-cluster-id.injectable";
import createStorageInjectable from "./utils/create-storage/create-storage.injectable";
import { observable, toJS } from "mobx";
import type { Draft } from "immer";
import { produce, isDraft } from "immer";

export const getDiForUnitTesting = (
  { doGeneralOverrides } = { doGeneralOverrides: false },
) => {
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
    di.override(createStorageInjectable, () => function <MockT>(key: string, defaultValue: MockT) {
      const srcValue = observable.box(defaultValue);

      return {
        get: () => srcValue.get(),
        isDefaultValue: val => isEqual(val, defaultValue),
        merge: (value: Partial<MockT> | ((draft: Draft<MockT>) => void | Partial<MockT>)) => {
          const nextValue = produce(toJS(srcValue.get()), (draft) => {

            if (typeof value == "function") {
              const newValue = value(draft);

              // merge returned plain objects from `value-as-callback` usage
              // otherwise `draft` can be just modified inside a callback without returning any value (void)
              if (newValue && !isDraft(newValue)) {
                Object.assign(draft, newValue);
              }
            } else if (isPlainObject(value)) {
              Object.assign(draft, value);
            }

            return draft;
          });

          srcValue.set(nextValue);
        },
        reset: () => srcValue.set(defaultValue),
        set: (val: MockT) => srcValue.set(val),
        get value() {
          return srcValue.get();
        },
        whenReady: Promise.resolve(),
      };
    });
    di.override(hostedClusterIdInjectable, () => undefined);

    di.override(getAbsolutePathInjectable, () => getAbsolutePathFake);
    di.override(joinPathsInjectable, () => joinPathsFake);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(extensionsStoreInjectable, () => ({ isEnabled: ({ id, isBundled }) => false }) as ExtensionsStore);

    di.override(hotbarStoreInjectable, () => ({}));

    di.override(fileSystemProvisionerStoreInjectable, () => ({}) as FileSystemProvisionerStore);

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    di.override(clusterStoreInjectable, () => ({ getById: (id): Cluster => ({}) as Cluster }) as ClusterStore);
    di.override(userStoreInjectable, () => ({}) as UserStore);

    di.override(getValueFromRegisteredChannelInjectable, () => () => Promise.resolve(undefined as never));
    di.override(registerIpcChannelListenerInjectable, () => () => undefined);

    overrideFsWithFakes(di);

    di.override(observableHistoryInjectable, () => {
      const historyFake = createMemoryHistory();

      return createObservableHistory(historyFake, {
        searchParams: searchParamsOptions,
      });
    });

    di.override(focusWindowInjectable, () => () => {});

    di.override(loggerInjectable, () => ({
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      silly: jest.fn(),
    }));
  }

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
