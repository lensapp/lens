import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import fsInjectable from "../fs/fs.injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";

export type ReadFile = (filePath: string) => AsyncCallSuccess<string>;

export const readFileInjectionToken = getInjectionToken<ReadFile>({
  id: "read-file-injection-token",
});

const readFileInjectable = getInjectable({
  id: "read-file",

  instantiate: (di): ReadFile => {
    const { readFile } = di.inject(fsInjectable);

    return async (filePath) => {
      const response = await readFile(filePath, "utf-8");

      return getSuccess(response);
    };
  },

  injectionToken: readFileInjectionToken,
});

export default readFileInjectable;
