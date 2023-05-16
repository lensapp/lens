import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import fsInjectable from "../fs/fs.injectable";
import { AsyncCallResult, getSuccess } from "@lensapp/utils";
import type { WriteJsonFile } from "./write-json-file.injectable";
import writeJsonFileInjectable from "./write-json-file.injectable";

describe("write-json-file", () => {
  let fsWriteFileMock: AsyncFnMock<(filePath: string) => Promise<void>>;
  let fsEnsureDirMock: AsyncFnMock<(directoryPath: string) => Promise<void>>;
  let writeJsonFile: WriteJsonFile;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsWriteFileMock = asyncFn();
    fsEnsureDirMock = asyncFn();

    const fsStub = {
      writeFile: fsWriteFileMock,
      ensureDir: fsEnsureDirMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    writeJsonFile = di.inject(writeJsonFileInjectable);
  });

  describe("when called", () => {
    let actualPromise: AsyncCallResult<void>;

    beforeEach(() => {
      actualPromise = writeJsonFile("./some-directory/some-other-directory/some-file.json", { some: "content" });
    });

    it("makes sure that directory exists", () => {
      expect(fsEnsureDirMock).toHaveBeenCalledWith("./some-directory/some-other-directory", { mode: 493 });
    });

    it("does not write file yet", () => {
      expect(fsWriteFileMock).not.toHaveBeenCalled();
    });

    describe("when ensuring existence of directory is resolves with success", () => {
      beforeEach(async () => {
        await fsEnsureDirMock.resolve();
      });

      it("writes file to filesystem", () => {
        expect(fsWriteFileMock).toHaveBeenCalledWith(
          "./some-directory/some-other-directory/some-file.json",
          JSON.stringify({ some: "content" }, null, 2),
          { encoding: "utf-8" },
        );
      });

      it("when writing resolves with success, resolves with success", async () => {
        await fsWriteFileMock.resolve();

        const actual = await actualPromise;

        expect(actual).toEqual(getSuccess(undefined));
      });

      it("when writing rejects with failure, resolves with failure", () => {
        const someError = new Error("some-error");

        fsWriteFileMock.reject(someError);

        return expect(actualPromise).rejects.toBe(someError);
      });
    });

    it("when ensuring existence of directory rejects, rejects with the original error", () => {
      const someError = new Error("some-error");

      fsEnsureDirMock.reject(someError);

      return expect(actualPromise).rejects.toBe(someError);
    });
  });
});
