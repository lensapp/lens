import path from "path";
import ElectronStore from "electron-store";
import { isTestEnv } from "../common/vars";

export interface MigrationOpts {
  version: string;
  run(store: ElectronStore, log: (...args: any[]) => void): void;
}

function infoLog(...args: any[]) {
  if (isTestEnv) return;
  console.log(...args);
}

export function migration({ version, run }: MigrationOpts) {
  return {
    [version]: (store: ElectronStore) => {
      const storeName = path.dirname(store.path);
      infoLog(`STORE MIGRATION (${storeName}): ${version}`, );
      run(store, infoLog);
    }
  };
}
