import { createContainer } from "@ogre-tools/injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import fsInjectable from "../fs/fs.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import type { ReadFile } from "./read-file.injectable";
import readFileInjectable from "./read-file.injectable";
import type { CallResult } from "@lensapp/utils";
import { getSuccess } from "@lensapp/utils";

describe("read-file", () => {
  let fsReadFileMock: AsyncFnMock<(fileName: string, encoding: string) => Promise<string>>;

  let readFile: ReadFile;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsReadFileMock = asyncFn();

    const fsStub = {
      readFile: fsReadFileMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    readFile = di.inject(readFileInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<CallResult<string>>;

    beforeEach(() => {
      actualPromise = readFile("some-file.js");
    });

    it("calls for file from file system", () => {
      expect(fsReadFileMock).toHaveBeenCalledWith("some-file.js", "utf-8");
    });

    it("when reading file resolves, resolves with success", async () => {
      await fsReadFileMock.resolve("some-content");

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess("some-content"));
    });

    it("when reading file rejects, throws", async () => {
      const someError = new Error("some-error");

      fsReadFileMock.reject(someError);

      return expect(actualPromise).rejects.toBe(someError);
    });
  });
});
