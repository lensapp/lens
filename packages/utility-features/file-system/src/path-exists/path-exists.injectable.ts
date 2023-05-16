import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import fsInjectable from "../fs/fs.injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";

export type PathExists = (path: string) => AsyncCallSuccess<boolean>;

export const pathExistsInjectionToken = getInjectionToken<PathExists>({
  id: "path-exists-injection-token",
});

const pathExistsInjectable = getInjectable({
  id: "path-exists",
  instantiate: (di): PathExists => {
    const pathExists = di.inject(fsInjectable).pathExists;

    return async (filePath: string) => {
      const result = await pathExists(filePath);

      return getSuccess(result);
    };
  },

  injectionToken: pathExistsInjectionToken,
});

export default pathExistsInjectable;
