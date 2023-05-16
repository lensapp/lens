import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import fsInjectable from "../fs/fs.injectable";
import type { AsyncCallSuccess } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";

export type DeleteFile = (filePath: string) => AsyncCallSuccess<void>;

export const deleteFileInjectionToken = getInjectionToken<DeleteFile>({
  id: "delete-file-injection-token",
});

const deleteFileInjectable = getInjectable({
  id: "delete-file",

  instantiate: (di): DeleteFile => {
    const unlink = di.inject(fsInjectable).unlink;

    return async (filePath) => {
      await unlink(filePath);

      return getSuccess(undefined);
    };
  },

  injectionToken: deleteFileInjectionToken,
});

export default deleteFileInjectable;
