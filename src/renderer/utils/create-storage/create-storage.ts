/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Keeps window.localStorage state in external JSON-files.
// Because app creates random port between restarts => storage session wiped out each time.
import path from "path";
import { comparer, observable, reaction, toJS } from "mobx";
import { StorageHelper } from "../storageHelper";
import { getHostedClusterId } from "../../../common/utils";
import type { JsonValue } from "type-fest";
import { isTestEnv } from "../../../common/vars";
import logger from "../../../common/logger";
import type { StorageLayer } from "..";

const storage = observable({
  initialized: false,
  loaded: false,
  data: {} as Record<string/*key*/, any>, // json-serializable
});

interface Dependencies {
  directoryForLensLocalStorage: string;
  readJsonFile: (filePath: string) => Promise<JsonValue>;
  writeJsonFile: (filePath: string, contentObject: JsonValue) => Promise<void>;
}

/**
 * Creates a helper for saving data under the "key" intended for window.localStorage
 */
export async function createStorage<T>({ directoryForLensLocalStorage, readJsonFile, writeJsonFile }: Dependencies, key: string, defaultValue: T): Promise<StorageLayer<T>> {
  const { logPrefix } = StorageHelper;

  if (!storage.initialized) {
    storage.initialized = true;

    const filePath = path.resolve(directoryForLensLocalStorage, `${getHostedClusterId() || "app"}.json`);

    try {
      const data = await readJsonFile(filePath);

      if (data && typeof data === "object") {
        storage.data = data;
      }
    } catch {
      // ignore error
    } finally {
      if (!isTestEnv) {
        logger.info(`${logPrefix} loading finished for ${filePath}`);
      }

      storage.loaded = true;
    }

    const saveFile = async (state: Record<string, any> = {}) => {
      logger.info(`${logPrefix} saving ${filePath}`);

      try {
        await writeJsonFile(filePath, state);
      } catch (error) {
        logger.error(`${logPrefix} saving failed: ${error}`, {
          json: state, jsonFilePath: filePath,
        });
      }
    };

    // bind auto-saving data changes to %storage-file.json
    reaction(() => toJS(storage.data), saveFile, {
      delay: 250, // lazy, avoid excessive writes to fs
      equals: comparer.structural, // save only when something really changed
    });
  }

  return new StorageHelper<T>(key, {
    autoInit: true,
    defaultValue,
    storage: {
      getItem(key: string) {
        return storage.data[key];
      },
      setItem(key: string, value: any) {
        storage.data[key] = value;
      },
      removeItem(key: string) {
        delete storage.data[key];
      },
    },
  });
}
