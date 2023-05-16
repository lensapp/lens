import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import fsInjectable from "../fs/fs.injectable";
import deleteFileInjectable, { DeleteFile } from "./delete-file.injectable";
import { AsyncCallResult, getSuccess } from "@lensapp/utils";

describe("delete-file", () => {
  let fsUnlinkMock: AsyncFnMock<(filePath: string) => Promise<void>>;
  let deleteFile: DeleteFile;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsUnlinkMock = asyncFn();

    const fsStub = {
      unlink: fsUnlinkMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    deleteFile = di.inject(deleteFileInjectable);
  });

  describe("when called", () => {
    let actualPromise: AsyncCallResult<void>;

    beforeEach(() => {
      actualPromise = deleteFile("./some-directory/some-file.js");
    });

    it("calls for unlink from file system", () => {
      expect(fsUnlinkMock).toHaveBeenCalledWith("./some-directory/some-file.js");
    });

    it("when unlink resolves, resolves with success", async () => {
      await fsUnlinkMock.resolve();

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess(undefined));
    });

    it("when unlink rejects, rejects with the original error", () => {
      const someError = new Error("some-error");

      fsUnlinkMock.reject(someError);

      return expect(actualPromise).rejects.toBe(someError);
    });
  });
});
