import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";
import readFileInjectable from "../read-file/read-file.injectable";
import yaml from "js-yaml";

export type ReadYamlFile = (filePath: string) => AsyncCallSuccess<object>;

export const readYamlFileInjectionToken = getInjectionToken<ReadYamlFile>({
  id: "read-yaml-file-injection-token",
});

const readYamlFileInjectable = getInjectable({
  id: "read-yaml-file",

  instantiate: (di): ReadYamlFile => {
    const readFile = di.inject(readFileInjectable);

    return async (filePath: string) => {
      const call = await readFile(filePath);

      const parsedResponse = yaml.load(call.response) as object;

      return getSuccess(parsedResponse);
    };
  },

  injectionToken: readYamlFileInjectionToken,
});

export default readYamlFileInjectable;
