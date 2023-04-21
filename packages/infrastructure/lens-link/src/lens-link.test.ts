import type { LensLink } from "./lens-link.injectable";
import asyncFn from "@async-fn/jest";
import type { AsyncFnMock } from "@async-fn/jest";
import { getPromiseStatus } from "@k8slens/test-utils";
import path from "path";
import lensLinkInjectable from "./lens-link.injectable";
import type { Exists } from "./fs/exists.injectable";
import type { ReadJsonFile } from "./fs/read-json-file.injectable";
import type { WriteJsonFile } from "./fs/write-json-file.injectable";
import type { CreateSymlink } from "./fs/create-symlink.injectable";
import type { EnsureEmptyDirectory } from "./fs/ensure-empty-directory.injectable";
import { workingDirectoryInjectable } from "./working-directory.injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { existsInjectable } from "./fs/exists.injectable";
import { readJsonFileWithoutErrorHandlingInjectable } from "./fs/read-json-file.injectable";
import { writeJsonFileInjectable } from "./fs/write-json-file.injectable";
import { createSymlinkInjectable } from "./fs/create-symlink.injectable";
import { ensureEmptyDirectoryInjectable } from "./fs/ensure-empty-directory.injectable";
import { getDi } from "./get-di";
import type { Glob } from "./fs/glob.injectable";
import { globInjectable } from "./fs/glob.injectable";
import type { IsFileOrDirectory } from "./fs/is-file-or-directory.injectable";
import { isFileOrDirectoryInjectable } from "./fs/is-file-or-directory.injectable";

describe("lens-link", () => {
  let lensLink: LensLink;
  let existsMock: AsyncFnMock<Exists>;
  let readJsonFileMock: AsyncFnMock<ReadJsonFile>;
  let writeJsonFileMock: AsyncFnMock<WriteJsonFile>;
  let createSymlinkMock: AsyncFnMock<CreateSymlink>;
  let ensureEmptyDirectoryMock: AsyncFnMock<EnsureEmptyDirectory>;
  let globMock: AsyncFnMock<Glob>;
  let isFileOrDirectoryMock: AsyncFnMock<IsFileOrDirectory>;

  beforeEach(() => {
    existsMock = asyncFn();
    readJsonFileMock = asyncFn();
    writeJsonFileMock = asyncFn();
    createSymlinkMock = asyncFn();
    ensureEmptyDirectoryMock = asyncFn();
    isFileOrDirectoryMock = asyncFn();
    globMock = asyncFn();

    const di = getDi();

    di.override(workingDirectoryInjectable, () => "/some-directory/some-project");
    di.override(resolvePathInjectable, () => path.posix.resolve);
    di.override(existsInjectable, () => existsMock);
    di.override(readJsonFileWithoutErrorHandlingInjectable, () => readJsonFileMock);
    di.override(writeJsonFileInjectable, () => writeJsonFileMock);
    di.override(createSymlinkInjectable, () => createSymlinkMock);
    di.override(ensureEmptyDirectoryInjectable, () => ensureEmptyDirectoryMock);
    di.override(globInjectable, () => globMock);
    di.override(isFileOrDirectoryInjectable, () => isFileOrDirectoryMock);

    lensLink = di.inject(lensLinkInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<void>;

    beforeEach(() => {
      actualPromise = lensLink();
    });

    it("checks for existence of config file", () => {
      expect(existsMock).toHaveBeenCalledWith("/some-directory/some-project/.lens-links.json");
    });

    describe("given config file does not exist", () => {
      beforeEach(async () => {
        await existsMock.resolve(false);
      });

      it("creates it as empty", () => {
        expect(writeJsonFileMock).toHaveBeenCalledWith("/some-directory/some-project/.lens-links.json", []);
      });

      it("does not read config file", () => {
        expect(readJsonFileMock).not.toHaveBeenCalled();
      });

      it("does not stop the script yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it("when creation resolves, stops the script", async () => {
        await writeJsonFileMock.resolve();

        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });
    });

    describe("given config file exists", () => {
      beforeEach(async () => {
        await existsMock.resolve(true);
      });

      it("does not create it again", () => {
        expect(writeJsonFileMock).not.toHaveBeenCalled();
      });

      it("reads config file", () => {
        expect(readJsonFileMock).toHaveBeenCalledWith("/some-directory/some-project/.lens-links.json");
      });

      describe("when config file resolves as empty", () => {
        beforeEach(async () => {
          await readJsonFileMock.resolve([]);
        });

        it("stops the script", async () => {
          const promiseStatus = await getPromiseStatus(actualPromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });

      describe("when config file resolves with module paths", () => {
        beforeEach(async () => {
          existsMock.mockClear();

          await readJsonFileMock.resolve(["../some-module", "/some-other-directory/some-other-module"]);
        });

        it("checks for existence of package.jsons in configured module paths", () => {
          expect(existsMock.mock.calls).toEqual([
            ["/some-directory/some-module/package.json"],
            ["/some-other-directory/some-other-module/package.json"],
          ]);
        });

        it("given some of the package.jsons do not exist, throws", () => {
          existsMock.resolve(false);
          existsMock.resolve(false);

          return expect(actualPromise).rejects.toThrow(
            'Tried to install Lens links, but configured package.jsons were not found: "/some-directory/some-module/package.json", "/some-other-directory/some-other-module/package.json".',
          );
        });

        describe("given all configured package.jsons exist", () => {
          beforeEach(async () => {
            readJsonFileMock.mockClear();

            await existsMock.resolve(true);
            await existsMock.resolve(true);
          });

          it("reads contents of package.jsons", () => {
            expect(readJsonFileMock.mock.calls).toEqual([
              ["/some-directory/some-module/package.json"],
              ["/some-other-directory/some-other-module/package.json"],
            ]);
          });

          it("when any of the reading fails, throws", () => {
            readJsonFileMock.reject(new Error("some-error"));

            return expect(actualPromise).rejects.toThrow(
              'Tried to read file "/some-directory/some-module/package.json", but error was thrown: "some-error"',
            );
          });

          describe("given some of the packages are NPM-scoped, when all contents resolve", () => {
            beforeEach(async () => {
              existsMock.mockClear();

              await readJsonFileMock.resolveSpecific(([path]) => path === "/some-directory/some-module/package.json", {
                name: "@some-scope/some-module",
                files: ["some-build-directory"],
                main: "some-build-directory/index.js",
              });

              await readJsonFileMock.resolveSpecific(
                ([path]) => path === "/some-other-directory/some-other-module/package.json",
                {
                  name: "@some-scope/some-other-module",
                  files: ["some-other-build-directory"],
                  main: "some-other-build-directory/index.js",
                },
              );
            });

            it("creates the Lens link directories to scoped directories", () => {
              expect(ensureEmptyDirectoryMock.mock.calls).toEqual([
                ["/some-directory/some-project/node_modules/@some-scope/some-module"],
                ["/some-directory/some-project/node_modules/@some-scope/some-other-module"],
              ]);
            });

            describe("when creation of Lens link directories and files or directories are identified is resolve", () => {
              beforeEach(async () => {
                await ensureEmptyDirectoryMock.resolve();
                await ensureEmptyDirectoryMock.resolve();

                await isFileOrDirectoryMock.resolve("dir");
                await isFileOrDirectoryMock.resolve("dir");
              });

              it("creates the symlinks to scoped directories", () => {
                expect(createSymlinkMock.mock.calls).toEqual([
                  [
                    "/some-directory/some-module/package.json",
                    "/some-directory/some-project/node_modules/@some-scope/some-module/package.json",
                    "file",
                  ],
                  [
                    "/some-directory/some-module/some-build-directory",
                    "/some-directory/some-project/node_modules/@some-scope/some-module/some-build-directory",
                    "dir",
                  ],
                  [
                    "/some-other-directory/some-other-module/package.json",
                    "/some-directory/some-project/node_modules/@some-scope/some-other-module/package.json",
                    "file",
                  ],
                  [
                    "/some-other-directory/some-other-module/some-other-build-directory",
                    "/some-directory/some-project/node_modules/@some-scope/some-other-module/some-other-build-directory",
                    "dir",
                  ],
                ]);
              });
            });
          });

          describe("given some of the packages have globs as files, when all contents resolve", () => {
            beforeEach(async () => {
              existsMock.mockClear();

              await readJsonFileMock.resolveSpecific(([path]) => path === "/some-directory/some-module/package.json", {
                name: "@some-scope/some-module",
                files: [
                  "some-duplicate-file",
                  "some-duplicate-file",
                  "some-build-directory-with-asterisk/*",
                  "some-build-directory-with-wild-card/**",
                  "some-build-directory-with-wild-card-before-asterisk/**/*",
                  "some-build-directory-with-asterisk-and-file-suffix/*.some-file-suffix",
                  "some-build-directory-with-file-name-and-asterisk/some-filename.*",
                  "some-build-directory-with-wild-card-and-asterisk-and-file-suffix/**/*.some-file-suffix",
                ],
                main: "some-build-directory/index.js",
              });

              await readJsonFileMock.resolveSpecific(
                ([path]) => path === "/some-other-directory/some-other-module/package.json",
                {
                  name: "@some-scope/some-other-module",
                  files: [],
                  main: "some-other-build-directory/index.js",
                },
              );
            });

            describe("given Lens link directories are handled", () => {
              beforeEach(async () => {
                await ensureEmptyDirectoryMock.resolve();
                await ensureEmptyDirectoryMock.resolve();
              });

              it("does not create symlinks yet", () => {
                expect(createSymlinkMock).not.toHaveBeenCalled();
              });

              it("calls for glob of file-strings for which glob cannot be avoided", () => {
                expect(globMock.mock.calls).toEqual([
                  [
                    [
                      "some-build-directory-with-asterisk-and-file-suffix/*.some-file-suffix",
                      "some-build-directory-with-file-name-and-asterisk/some-filename.*",
                      "some-build-directory-with-wild-card-and-asterisk-and-file-suffix/**/*.some-file-suffix",
                    ],

                    { cwd: "/some-directory/some-module" },
                  ],
                ]);
              });

              it("doesn't create symlinks yet", () => {
                expect(createSymlinkMock).not.toHaveBeenCalled();
              });

              describe("when globbing resolves and files or directories are identified", () => {
                beforeEach(async () => {
                  await globMock.resolve(["some-directory-from-glob/some-file-from-glob.txt", "some-duplicate-file"]);

                  await isFileOrDirectoryMock.resolve("file");
                  await isFileOrDirectoryMock.resolve("dir");
                  await isFileOrDirectoryMock.resolve("dir");
                  await isFileOrDirectoryMock.resolve("dir");
                });

                it("creates the symlinks to files and directories that were both globbed and that avoided globbing", () => {
                  expect(createSymlinkMock.mock.calls).toEqual([
                    [
                      "/some-directory/some-module/package.json",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/package.json",
                      "file",
                    ],

                    [
                      "/some-directory/some-module/some-directory-from-glob/some-file-from-glob.txt",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/some-directory-from-glob/some-file-from-glob.txt",
                      "file",
                    ],

                    [
                      "/some-directory/some-module/some-duplicate-file",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/some-duplicate-file",
                      "file",
                    ],

                    [
                      "/some-directory/some-module/some-build-directory-with-asterisk",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/some-build-directory-with-asterisk",
                      "dir",
                    ],

                    [
                      "/some-directory/some-module/some-build-directory-with-wild-card",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/some-build-directory-with-wild-card",
                      "dir",
                    ],

                    [
                      "/some-directory/some-module/some-build-directory-with-wild-card-before-asterisk",
                      "/some-directory/some-project/node_modules/@some-scope/some-module/some-build-directory-with-wild-card-before-asterisk",
                      "dir",
                    ],

                    [
                      "/some-other-directory/some-other-module/package.json",
                      "/some-directory/some-project/node_modules/@some-scope/some-other-module/package.json",
                      "file",
                    ],
                  ]);
                });
              });
            });
          });

          describe("when all contents resolve", () => {
            beforeEach(async () => {
              existsMock.mockClear();

              await readJsonFileMock.resolveSpecific(([path]) => path === "/some-directory/some-module/package.json", {
                name: "some-module",
                files: ["some-build-directory", "some-file"],
                main: "some-build-directory/index.js",
              });

              await readJsonFileMock.resolveSpecific(
                ([path]) => path === "/some-other-directory/some-other-module/package.json",
                {
                  name: "some-other-module",
                  files: ["some-other-build-directory"],
                  main: "some-other-build-directory/index.js",
                },
              );
            });

            it("creates the Lens link directories", () => {
              expect(ensureEmptyDirectoryMock.mock.calls).toEqual([
                ["/some-directory/some-project/node_modules/some-module"],
                ["/some-directory/some-project/node_modules/some-other-module"],
              ]);
            });

            it("does not create symlinks yet", () => {
              expect(createSymlinkMock).not.toHaveBeenCalled();
            });

            describe("when creation of Lens link directories resolve", () => {
              beforeEach(async () => {
                await ensureEmptyDirectoryMock.resolve();
                await ensureEmptyDirectoryMock.resolve();
              });

              it("doesn't create symlinks yet", () => {
                expect(createSymlinkMock).not.toHaveBeenCalled();
              });

              it("calls for if symlinks to be created are for files or directories", () => {
                expect(isFileOrDirectoryMock.mock.calls).toEqual([
                  ["/some-directory/some-module/some-build-directory"],
                  ["/some-directory/some-module/some-file"],
                  ["/some-other-directory/some-other-module/some-other-build-directory"],
                ]);
              });

              describe("given calls for files or directories resolve", () => {
                beforeEach(async () => {
                  await isFileOrDirectoryMock.resolveSpecific(
                    ["/some-directory/some-module/some-build-directory"],
                    "dir",
                  );

                  await isFileOrDirectoryMock.resolveSpecific(["/some-directory/some-module/some-file"], "file");

                  await isFileOrDirectoryMock.resolveSpecific(
                    ["/some-other-directory/some-other-module/some-other-build-directory"],
                    "dir",
                  );
                });

                it("creates the symlinks", () => {
                  expect(createSymlinkMock.mock.calls).toEqual([
                    [
                      "/some-directory/some-module/package.json",
                      "/some-directory/some-project/node_modules/some-module/package.json",
                      "file",
                    ],

                    [
                      "/some-directory/some-module/some-build-directory",
                      "/some-directory/some-project/node_modules/some-module/some-build-directory",
                      "dir",
                    ],

                    [
                      "/some-directory/some-module/some-file",
                      "/some-directory/some-project/node_modules/some-module/some-file",
                      "file",
                    ],

                    [
                      "/some-other-directory/some-other-module/package.json",
                      "/some-directory/some-project/node_modules/some-other-module/package.json",
                      "file",
                    ],

                    [
                      "/some-other-directory/some-other-module/some-other-build-directory",
                      "/some-directory/some-project/node_modules/some-other-module/some-other-build-directory",
                      "dir",
                    ],
                  ]);
                });

                it("given all symlink creations have not resolved, does not resolve yet", async () => {
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();

                  const promiseStatus = await getPromiseStatus(actualPromise);

                  expect(promiseStatus.fulfilled).toBe(false);
                });

                it("when symlink creations resolve, ends script", async () => {
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();
                  createSymlinkMock.resolve();

                  const promiseStatus = await getPromiseStatus(actualPromise);

                  expect(promiseStatus.fulfilled).toBe(true);
                });
              });
            });
          });
        });
      });
    });
  });
});
