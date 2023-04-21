import { getInjectable } from "@ogre-tools/injectable";
import { writeJsonFileInjectable } from "./fs/write-json-file.injectable";
import configFilePathInjectable from "./config-file-path.injectable";

const createEmptyConfigInjectable = getInjectable({
  id: "create-empty-config",

  instantiate: (di) => {
    const configFilePath = di.inject(configFilePathInjectable);
    const writeJsonFile = di.inject(writeJsonFileInjectable);

    return async () => {
      await writeJsonFile(configFilePath, []);
    };
  },
});

export default createEmptyConfigInjectable;
