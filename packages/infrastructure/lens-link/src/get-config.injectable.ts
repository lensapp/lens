import { getInjectable } from "@ogre-tools/injectable";
import { existsInjectable } from "./fs/exists.injectable";
import { readJsonFileInjectable } from "./fs/read-json-file.injectable";
import configFilePathInjectable from "./config-file-path.injectable";

export type Config = string[];

const getConfigInjectable = getInjectable({
  id: "get-config",

  instantiate: (di) => {
    const exists = di.inject(existsInjectable);
    const readJsonFile = di.inject(readJsonFileInjectable);
    const configFilePath = di.inject(configFilePathInjectable);

    return async () => {
      const configFileExists = await exists(configFilePath);

      if (!configFileExists) {
        return;
      }

      return readJsonFile(configFilePath) as unknown as Config;
    };
  },
});

export default getConfigInjectable;
