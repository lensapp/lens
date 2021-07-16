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
import { app, remote } from "electron";
import { comparer, observable, reaction, toJS, when } from "mobx";
import fse from "fs-extra";
import { StorageHelper } from "./storageHelper";
import logger from "../../main/logger";
import { getHostedClusterId } from "../../common/utils";

const storage = observable({
  initialized: false,
  loaded: false,
  data: {} as Record<string/*key*/, any>, // json-serializable
});

/**
 * Creates a helper for saving data under the "key" intended for window.localStorage
 * @param key
 * @param defaultValue
 */
export function createStorage<T>(key: string, defaultValue: T) {
  return createAppStorage(key, defaultValue, getHostedClusterId());
}

export function createAppStorage<T>(key: string, defaultValue: T, clusterId?: string | undefined) {
  const { logPrefix } = StorageHelper;
  const folder = path.resolve((app || remote.app).getPath("userData"), "lens-local-storage");
  const fileName = `${clusterId ?? "app"}.json`;
  const filePath = path.resolve(folder, fileName);

  if (!storage.initialized) {
    init(); // called once per cluster-view
  }

  function init() {
    storage.initialized = true;

    // read previously saved state (if any)
    fse.readJson(filePath)
      .then(data => storage.data = data)
      .catch(() => null) // ignore empty / non-existing / invalid json files
      .finally(() => {
        logger.info(`${logPrefix} loading finished for ${filePath}`);
        storage.loaded = true;
      });

    // bind auto-saving data changes to %storage-file.json
    reaction(() => toJS(storage.data), saveFile, {
      delay: 250, // lazy, avoid excessive writes to fs
      equals: comparer.structural, // save only when something really changed
    });

    async function saveFile(state: Record<string, any> = {}) {
      logger.info(`${logPrefix} saving ${filePath}`);

      try {
        await fse.ensureDir(folder, { mode: 0o755 });
        await fse.writeJson(filePath, state, { spaces: 2 });
      } catch (error) {
        logger.error(`${logPrefix} saving failed: ${error}`, {
          json: state, jsonFilePath: filePath
        });
      }
    }
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
      }
    },
  });
}
