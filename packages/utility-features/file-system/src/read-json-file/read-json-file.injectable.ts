import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";
import readFileInjectable from "../read-file/read-file.injectable";

export type ReadJsonFile = (filePath: string) => AsyncCallSuccess<any>;

export const readJsonFileInjectionToken = getInjectionToken<ReadJsonFile>({
  id: "read-json-file-injection-token",
});

const readJsonFileInjectable = getInjectable({
  id: "read-json-file",

  instantiate: (di): ReadJsonFile => {
    const readFile = di.inject(readFileInjectable);

    return async (filePath) => {
      const call = await readFile(filePath);

      return getSuccess(JSON.parse(call.response));
    };
  },

  injectionToken: readJsonFileInjectionToken,
});

export default readJsonFileInjectable;
