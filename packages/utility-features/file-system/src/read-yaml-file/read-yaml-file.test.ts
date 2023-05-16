import { createContainer } from "@ogre-tools/injectable";
import readYamlFileInjectable, { ReadYamlFile } from "./read-yaml-file.injectable";
import { registerFeature } from "@lensapp/feature-core";
import { fileSystemFeature } from "../feature";
import { CallResult, getSuccess } from "@lensapp/utils";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import fsInjectable from "../fs/fs.injectable";

describe("read-yaml-file", () => {
  let fsReadFileMock: AsyncFnMock<(fileName: string, encoding: string) => Promise<string>>;

  let readYamlFile: ReadYamlFile;

  beforeEach(() => {
    const di = createContainer("irrelevant");

    registerFeature(di, fileSystemFeature);

    fsReadFileMock = asyncFn();

    const fsStub = {
      readFile: fsReadFileMock,
    };

    di.override(fsInjectable, () => fsStub as any);

    readYamlFile = di.inject(readYamlFileInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<CallResult<object>>;

    beforeEach(() => {
      actualPromise = readYamlFile("some-file.js");
    });

    it("calls for file from file system", () => {
      expect(fsReadFileMock).toHaveBeenCalledWith("some-file.js", "utf-8");
    });

    it("when reading file resolves, resolves with success", async () => {
      await fsReadFileMock.resolve("some: content");

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
