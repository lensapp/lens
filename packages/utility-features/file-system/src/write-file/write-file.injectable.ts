import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { WriteFileOptions } from "fs-extra";
import fsInjectable from "../fs/fs.injectable";
import getDirnameOfPathInjectable from "../path/get-dirname.injectable";
import { AsyncCallSuccess, getSuccess } from "@lensapp/utils";

export type WriteFile = (
  filePath: string,
  content: string | Buffer,
  opts?: WriteFileOptions
) => AsyncCallSuccess<void>;

export const writeFileInjectionToken = getInjectionToken<WriteFile>({
  id: "write-file-injection-token",
});

const writeFileInjectable = getInjectable({
  id: "write-file",

  instantiate: (di): WriteFile => {
    const { writeFile, ensureDir } = di.inject(fsInjectable);
    const getDirnameOfPath = di.inject(getDirnameOfPathInjectable);

    return async (filePath, content) => {
      await ensureDir(getDirnameOfPath(filePath), {
        mode: 0o755,
      });

      await writeFile(filePath, content, {
        encoding: "utf-8",
      });

      return getSuccess(undefined);
    };
  },

  injectionToken: writeFileInjectionToken,
});

export default writeFileInjectable;
