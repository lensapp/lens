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
import type { CreateObservableOptions } from "mobx/lib/api/observable";

import path from "path";
import { app, remote } from "electron";
import { observable, reaction, when } from "mobx";
import fse from "fs-extra";
import { StorageHelper } from "./storageHelper";
import { ClusterStore, getHostedClusterId } from "../../common/cluster-store";
import logger from "../../main/logger";

let initialized = false;
const loaded = observable.box(false);
const storage = observable.map<string/* key */, any /* serializable */>();

export function createStorage<T>(key: string, defaultValue: T, observableOptions?: CreateObservableOptions) {
  const clusterId = getHostedClusterId();
  const savingFolder = path.resolve((app || remote.app).getPath("userData"), "lens-local-storage");
  const jsonFilePath = path.resolve(savingFolder, `${clusterId ?? "app"}.json`);

  if (!initialized) {
    initialized = true;

    // read once per cluster domain
    fse.readJson(jsonFilePath)
      .then((data = {}) => storage.merge(data))
      .catch(() => null) // ignore empty / non-existing / invalid json files
      .finally(() => loaded.set(true));

    // bind auto-saving
    reaction(() => storage.toJSON(), saveFile, { delay: 250 });

    // remove json-file when cluster deleted
    if (clusterId !== undefined) {
      when(() => ClusterStore.getInstance(false)?.removedClusters.has(clusterId)).then(removeFile);
    }
  }

  async function saveFile(json = {}) {
    try {
      await fse.ensureDir(savingFolder, { mode: 0o755 });
      await fse.writeJson(jsonFilePath, json, { spaces: 2 });
    } catch (error) {
      logger.error(`[save]: ${error}`, { json, jsonFilePath });
    }
  }

  function removeFile() {
    logger.debug("[remove]:", jsonFilePath);
    fse.unlink(jsonFilePath).catch(Function);
  }

  return new StorageHelper<T>(key, {
    autoInit: true,
    observable: observableOptions,
    defaultValue,
    storage: {
      async getItem(key: string) {
        await when(() => loaded.get());

        return storage.get(key);
      },
      setItem(key: string, value: any) {
        storage.set(key, value);
      },
      removeItem(key: string) {
        storage.delete(key);
      }
    },
  });
}
