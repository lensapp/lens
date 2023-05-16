import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { JsonValue } from "type-fest";
import writeFileInjectable from "../write-file/write-file.injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";

export type WriteJsonFile = (
  filePath: string,
  contents: JsonValue
) => AsyncCallSuccess<void>;

export const writeJsonFileInjectionToken = getInjectionToken<WriteJsonFile>({
  id: "write-json-file-injection-token",
});

const writeJsonFileInjectable = getInjectable({
  id: "write-json-file",

  instantiate: (di): WriteJsonFile => {
    const writeFile = di.inject(writeFileInjectable);

    return async (filePath, content) =>
      writeFile(filePath, JSON.stringify(content, null, 2));
  },

  injectionToken: writeJsonFileInjectionToken,
});

export default writeJsonFileInjectable;
