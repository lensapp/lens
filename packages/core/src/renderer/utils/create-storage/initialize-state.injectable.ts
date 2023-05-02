/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import AwaitLock from "await-lock";
import { comparer, reaction, runInAction, toJS } from "mobx";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import joinPathsInjectable from "../../../common/path/join-paths.injectable";
import setupAppPathsInjectable from "../../app-paths/setup-app-paths.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import hostedClusterIdInjectable from "../../cluster-frame-context/hosted-cluster-id.injectable";
import { storageHelperLogPrefix } from "../storage-helper";
import lensLocalStorageStateInjectable from "./state.injectable";
import storageSaveDelayInjectable from "./storage-save-delay.injectable";

const initializeStateInjectable = getInjectable({
  id: "initialize-lens-local-storage-state",
  instantiate: (di) => ({
    run: async () => {
      const joinPaths = di.inject(joinPathsInjectable);
      const directoryForLensLocalStorage = di.inject(directoryForLensLocalStorageInjectable);
      const hostedClusterId = di.inject(hostedClusterIdInjectable);
      const lensLocalStorageState = di.inject(lensLocalStorageStateInjectable);
      const readJsonFile = di.inject(readJsonFileInjectable);
      const writeJsonFile = di.inject(writeJsonFileInjectable);
      const logger = di.inject(loggerInjectionToken);
      const storageSaveDelay = di.inject(storageSaveDelayInjectable);
      const lock = new AwaitLock();

      const filePath = joinPaths(directoryForLensLocalStorage, `${hostedClusterId || "app"}.json`);

      try {
        const localFile = await readJsonFile(filePath);

        if (typeof localFile === "object") {
          runInAction(() => {
            Object.assign(lensLocalStorageState, localFile);
          });
        }
      } catch {
        // do nothing
      } finally {
        logger.info(`${storageHelperLogPrefix} loading finished for ${filePath}`);
      }

      reaction(() => toJS(lensLocalStorageState), saveFile, {
        delay: storageSaveDelay, // lazy, avoid excessive writes to fs
        equals: comparer.structural, // save only when something really changed
      });

      async function saveFile(state: Record<string, unknown>) {
        try {
          await lock.acquireAsync();
          logger.info(`${storageHelperLogPrefix} saving ${filePath}`);
          await writeJsonFile(filePath, state);
        } catch (error) {
          logger.error(`${storageHelperLogPrefix} saving failed: ${error}`, {
            json: state, jsonFilePath: filePath,
          });
        } finally {
          lock.release();
        }
      }
    },
    runAfter: setupAppPathsInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initializeStateInjectable;
