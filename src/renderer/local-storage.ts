import path from "path";
import fse from "fs-extra";
import { isEmpty, noop } from "lodash";
import { app, remote } from "electron";
import { action, observable, reaction, when, } from "mobx";
import { StorageHelper, StorageHelperOptions } from "./utils/storageHelper";

export * from "./utils/storageHelper";

export class LensLocalStorage {
  private folderPath = path.resolve((app || remote.app).getPath("userData"), "lens-local-storage");
  private filePath: string;

  @observable state = observable.map<string, any>();
  @observable isLoaded = false;
  whenReady = when(() => this.isLoaded);

  getPath(fileName: string): string {
    return path.resolve(this.folderPath, `${fileName}.json`);
  }

  async init(clusterId?: string) {
    this.filePath = this.getPath(clusterId ?? "app");

    try {
      await this.load();
      this.bindAutoSave();
    } catch (error) {
      console.error(`[init]: ${error}`, this);
    }
  }

  private bindAutoSave() {
    return reaction(() => this.state.toJSON(), state => this.save(state), {
      delay: 500, // lazy backup
    });
  }

  @action
  private async load() {
    try {
      await fse.ensureDir(this.folderPath, { mode: 0o755 });
      const state = await fse.readJson(this.filePath);

      this.state.replace(state);
    } catch (error) {
    }
    this.isLoaded = true;
  }

  private async save(state: object) {
    if (isEmpty(state)) {
      return; // skip empty state on clear
    }

    try {
      await fse.writeJson(this.filePath, state, { spaces: 2 });
    } catch (error) {
      console.error(`[save]: ${error}`, this);
    }
  }

  @action
  clear() {
    this.state.clear();
    fse.unlink(this.filePath).catch(noop);
  }
}

export const lensLocalStorage = new LensLocalStorage();

export function createStorage<T>(key: string, defaultValue?: T, options: StorageHelperOptions<T> = {}) {
  return new StorageHelper<T>(key, defaultValue, {
    ...options,
    storage: {
      async getItem(key: string) {
        await lensLocalStorage.whenReady;

        return lensLocalStorage.state.get(key);
      },
      setItem(key: string, value: any) {
        lensLocalStorage.state.set(key, value);
      },
      removeItem(key: string) {
        lensLocalStorage.state.delete(key);
      },
    },
  });
}
