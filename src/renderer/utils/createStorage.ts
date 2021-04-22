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
