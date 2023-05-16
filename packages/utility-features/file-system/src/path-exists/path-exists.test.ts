import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import fsInjectable from "../fs/fs.injectable";
import type { PathExists } from "./path-exists.injectable";
import pathExistsInjectable from "./path-exists.injectable";
import type { AsyncCallResult } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";

describe("path-exists", () => {
  let fsPathExistsMock: AsyncFnMock<(filePath: string) => Promise<boolean>>;
  let pathExists: PathExists;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsPathExistsMock = asyncFn();

    const fsStub = {
      pathExists: fsPathExistsMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    pathExists = di.inject(pathExistsInjectable);
  });

  describe("when called", () => {
    let actualPromise: AsyncCallResult<boolean>;

    beforeEach(() => {
      actualPromise = pathExists("./some-directory/some-file.js");
    });

    it("calls for filesystem", () => {
      expect(fsPathExistsMock).toHaveBeenCalledWith("./some-directory/some-file.js");
    });

    it("when call resolves with true, resolves with true", async () => {
      await fsPathExistsMock.resolve(true);

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess(true));
    });

    it("when call resolves with false, resolves with false", async () => {
      await fsPathExistsMock.resolve(false);

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess(false));
    });
  });
});
