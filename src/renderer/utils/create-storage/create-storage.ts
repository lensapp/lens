/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Keeps window.localStorage state in external JSON-files.
// Because app creates random port between restarts => storage session wiped out each time.
import { comparer, reaction, toJS, when } from "mobx";
import type { StorageLayer } from "../storageHelper";
import { storageHelperLogPrefix, StorageHelper } from "../storageHelper";
import type { JsonObject } from "type-fest";
import type { Logger } from "../../../common/logger";
import type { JoinPaths } from "../../../common/path/join-paths.injectable";
import type { WriteJson } from "../../../common/fs/write-json-file.injectable";
import type { ReadJson } from "../../../common/fs/read-json-file.injectable";

interface Dependencies {
  storage: { initialized: boolean; loaded: boolean; data: Partial<Record<string, unknown>> };
  logger: Logger;
  directoryForLensLocalStorage: string;
  readJsonFile: ReadJson;
  writeJsonFile: WriteJson;
  joinPaths: JoinPaths;
  hostedClusterId: string | undefined;
  saveDelay: number;
}

export type CreateStorage = <T>(key: string, defaultValue: T) => StorageLayer<T>;

/**
 * Creates a helper for saving data under the "key" intended for window.localStorage
 */
export const createStorage = ({
  storage,
  joinPaths,
  logger,
  directoryForLensLocalStorage,
  readJsonFile,
  writeJsonFile,
  hostedClusterId,
  saveDelay,
}: Dependencies): CreateStorage => <T>(key: string, defaultValue: T) => {
  if (!storage.initialized) {
    storage.initialized = true;

    (async () => {
      const filePath = joinPaths(directoryForLensLocalStorage, `${hostedClusterId || "app"}.json`);

      try {
        storage.data = (await readJsonFile(filePath)) as JsonObject;
      } catch {
        // do nothing
      } finally {
        logger.info(`${storageHelperLogPrefix} loading finished for ${filePath}`);
        storage.loaded = true;
      }

      // bind auto-saving data changes to %storage-file.json
      reaction(() => toJS(storage.data), saveFile, {
        delay: saveDelay, // lazy, avoid excessive writes to fs
        equals: comparer.structural, // save only when something really changed
      });

      async function saveFile(state: Record<string, any> = {}) {
        logger.info(`${storageHelperLogPrefix} saving ${filePath}`);

        try {
          await writeJsonFile(filePath, state);
        } catch (error) {
          logger.error(`${storageHelperLogPrefix} saving failed: ${error}`, {
            json: state, jsonFilePath: filePath,
          });
        }
      }
    })()
      .catch(error => logger.error(`${storageHelperLogPrefix} Failed to initialize storage: ${error}`));
  }

  return new StorageHelper({
    logger,
  }, key, {
    autoInit: true,
    defaultValue,
    storage: {
      async getItem(key: string) {
        await when(() => storage.loaded);

        return storage.data[key] as T;
      },
      setItem(key: string, value: T) {
        storage.data[key] = value;
      },
      removeItem(key: string) {
        delete storage.data[key];
      },
    },
  });
};
