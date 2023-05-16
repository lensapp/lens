import { createContainer } from "@ogre-tools/injectable";
import readJsonFileInjectable, { ReadJsonFile } from "./read-json-file.injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import { CallResult, getSuccess } from "@lensapp/utils";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import fsInjectable from "../fs/fs.injectable";

describe("read-json-file", () => {
  let fsReadFileMock: AsyncFnMock<(fileName: string, encoding: string) => Promise<string>>;

  let readJsonFile: ReadJsonFile;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsReadFileMock = asyncFn();

    const fsStub = {
      readFile: fsReadFileMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    readJsonFile = di.inject(readJsonFileInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<CallResult<any>>;

    beforeEach(() => {
      actualPromise = readJsonFile("some-file.js");
    });

    it("calls for file from file system", () => {
      expect(fsReadFileMock).toHaveBeenCalledWith("some-file.js", "utf-8");
    });

    it("when reading file resolves, resolves with success", async () => {
      await fsReadFileMock.resolve(JSON.stringify({ some: "content" }));

      const actual = await actualPromise;

      expect(actual).toEqual(getSuccess({ some: "content" }));
    });

    it("when reading file rejects, throws", async () => {
      const someError = new Error("some-error");

      fsReadFileMock.reject(someError);

      return expect(actualPromise).rejects.toBe(someError);
    });
  });
});
