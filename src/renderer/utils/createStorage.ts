// Keeps window.localStorage state in external JSON-files.
// Because app creates random port between restarts => storage session wiped out each time.
import path from "path";
import { app, remote } from "electron";
import { comparer, observable, reaction, toJS, when } from "mobx";
import fse from "fs-extra";
import { StorageHelper } from "./storageHelper";
import { ClusterStore, getHostedClusterId } from "../../common/cluster-store";
import logger from "../../main/logger";

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
  const { logPrefix } = StorageHelper;
  const clusterId = getHostedClusterId();
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

    // remove json-file when cluster deleted
    if (clusterId !== undefined) {
      when(() => ClusterStore.getInstance(false)?.removedClusters.has(clusterId)).then(removeFile);
    }

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

    function removeFile() {
      logger.debug(`${logPrefix} removing ${filePath}`);
      fse.unlink(filePath).catch(Function);
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
