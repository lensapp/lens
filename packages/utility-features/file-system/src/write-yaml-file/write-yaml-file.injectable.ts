import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import writeFileInjectable from "../write-file/write-file.injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import yaml from "js-yaml";

export type WriteYamlFile = (
  filePath: string,
  contents: object
) => AsyncCallSuccess<void>;

export const writeYamlFileInjectionToken = getInjectionToken<WriteYamlFile>({
  id: "write-yaml-file-injection-token",
});

const writeYamlFileInjectable = getInjectable({
  id: "write-yaml-file",

  instantiate: (di): WriteYamlFile => {
    const writeFile = di.inject(writeFileInjectable);

    return async (filePath, content) => writeFile(filePath, yaml.dump(content));
  },

  injectionToken: writeYamlFileInjectionToken,
});

export default writeYamlFileInjectable;
