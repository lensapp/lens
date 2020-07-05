import Config from "conf";
import { isTestEnv } from "../common/vars";

export interface MigrationOpts {
  version: string;
  run(storeConfig: Config<any>, log: (...args: any[]) => void): void;
}

function infoLog(...args: any[]) {
  if (isTestEnv) return;
  console.log(...args);
}

export function migration<S = any>({ version, run }: MigrationOpts) {
  return {
    [version]: (storeConfig: Config<S>) => {
      infoLog(`STORE MIGRATION (${storeConfig.path}): ${version}`,);
      run(storeConfig, infoLog);
    }
  };
}
