/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Keeps window.localStorage state in external JSON-files.
// Because app creates random port between restarts => storage session wiped out each time.
import path from "path";
import { comparer, observable, reaction, toJS, when } from "mobx";
import { StorageHelper } from "../storageHelper";
import logger from "../../../main/logger";
import { isTestEnv } from "../../../common/vars";

import { getHostedClusterId } from "../../../common/utils";
import type { JsonObject } from "type-fest";

const storage = observable({
  initialized: false,
  loaded: false,
  data: {} as Record<string/*key*/, any>, // json-serializable
});

interface Dependencies {
  directoryForLensLocalStorage: string;
  readJsonFile: (filePath: string) => Promise<JsonObject>;
  writeJsonFile: (filePath: string, contentObject: JsonObject) => Promise<void>;
}

/**
 * Creates a helper for saving data under the "key" intended for window.localStorage
 */
export const createStorage = ({ directoryForLensLocalStorage, readJsonFile, writeJsonFile }: Dependencies) => <T>(key: string, defaultValue: T) => {
  const { logPrefix } = StorageHelper;

  if (!storage.initialized) {
    storage.initialized = true;

    (async () => {
      const filePath = path.resolve(directoryForLensLocalStorage, `${getHostedClusterId() || "app"}.json`);

      try {
        storage.data = await readJsonFile(filePath);
      }

      // eslint-disable-next-line no-empty
      catch {}

      finally {
        if (!isTestEnv) {
          logger.info(`${logPrefix} loading finished for ${filePath}`);
        }

        storage.loaded = true;
      }

      // bind auto-saving data changes to %storage-file.json
      reaction(() => toJS(storage.data), saveFile, {
        delay: 250, // lazy, avoid excessive writes to fs
        equals: comparer.structural, // save only when something really changed
      });

      async function saveFile(state: Record<string, any> = {}) {
        logger.info(`${logPrefix} saving ${filePath}`);

        try {
          await writeJsonFile(filePath, state);
        } catch (error) {
          logger.error(`${logPrefix} saving failed: ${error}`, {
            json: state, jsonFilePath: filePath,
          });
        }
      }
    })()
      .catch(error => logger.error(`${logPrefix} Failed to initialize storage: ${error}`));
  }

  return new StorageHelper<T>(key, {
    autoInit: true,
    defaultValue,
    storage: {
      async getItem(key: string) {
        await when(() => storage.loaded);

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
};
