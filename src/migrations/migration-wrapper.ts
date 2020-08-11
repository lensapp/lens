import Config from "conf";
import { isTestEnv } from "../common/vars";

export interface MigrationOpts {
  version: string;
  run(storeConfig: Config<any>, log: (...args: any[]) => void): Promise<void>;
}

function infoLog(...args: any[]) {
  if (isTestEnv) return;
  console.log(...args);
}

export function migration<S = any>({ version, run }: MigrationOpts) {
  return {
    [version]: async (storeConfig: Config<S>) => {
      infoLog(`STORE MIGRATION (${storeConfig.path}): ${version}`,);
      await run(storeConfig, infoLog);
    }
  };
}
