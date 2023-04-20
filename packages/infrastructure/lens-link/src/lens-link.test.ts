import {
  EnsureDirectory,
  CreateSymlink,
  Exists,
  lensLinkFor,
  ReadJsonFile,
  WriteJsonFile,
  RemoveDirectory,
} from "./lens-link";
import type { LensLink } from "./lens-link";
import asyncFn from "@async-fn/jest";
import type { AsyncFnMock } from "@async-fn/jest";
import { getPromiseStatus } from "@k8slens/test-utils";
import path from "path";

describe("lens-link", () => {
  let lensLink: LensLink;
  let existsMock: AsyncFnMock<Exists>;
  let readJsonFileMock: AsyncFnMock<ReadJsonFile>;
  let writeJsonFileMock: AsyncFnMock<WriteJsonFile>;
  let createSymlinkMock: AsyncFnMock<CreateSymlink>;
  let ensureDirectoryMock: AsyncFnMock<EnsureDirectory>;
  let removeDirectoryMock: AsyncFnMock<RemoveDirectory>;

  beforeEach(() => {
    existsMock = asyncFn();
    readJsonFileMock = asyncFn();
    writeJsonFileMock = asyncFn();
    createSymlinkMock = asyncFn();
    ensureDirectoryMock = asyncFn();
    removeDirectoryMock = asyncFn();

    lensLink = lensLinkFor({
      workingDirectory: "/some-directory/some-project",
      resolvePath: path.posix.resolve,
      exists: existsMock,
      readJsonFile: readJsonFileMock,
      writeJsonFile: writeJsonFileMock,
      createSymlink: createSymlinkMock,
      ensureDirectory: ensureDirectoryMock,
      removeDirectory: removeDirectoryMock,
    });
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

          xit("when any of the reading fails, throws", () => {});

          xit("given some of the package is scoped, when all contents resolve", () => {});

          describe("when all contents resolve", () => {
            beforeEach(async () => {
              await existsMock.mockClear();

              await readJsonFileMock.resolveSpecific(([path]) => path === "/some-directory/some-module/package.json", {
                name: "some-module",
                files: ["some-build-directory"],
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

            it("checks for existing Lens link directories", () => {
              expect(existsMock.mock.calls).toEqual([
                ["/some-directory/some-project/node_modules/some-module"],
                ["/some-directory/some-project/node_modules/some-other-module"],
              ]);
            });

            it("does not create the Lens link directories yet", () => {
              expect(ensureDirectoryMock).not.toHaveBeenCalled();
            });

            describe("given some Lens link directories exist", () => {
              beforeEach(async () => {
                await existsMock.resolveSpecific(
                  ([path]) => path === "/some-directory/some-project/node_modules/some-module",
                  false,
                );

                await existsMock.resolveSpecific(
                  ([path]) => path === "/some-directory/some-project/node_modules/some-other-module",
                  true,
                );
              });

              it("does not create the Lens link directories yet", () => {
                expect(ensureDirectoryMock).not.toHaveBeenCalled();
              });

              it("removes the existing Lens link directories", () => {
                expect(removeDirectoryMock.mock.calls).toEqual([
                  ["/some-directory/some-project/node_modules/some-other-module"],
                ]);
              });

              it("when removing resolves, creates the Lens link directories", async () => {
                await removeDirectoryMock.resolve();

                expect(ensureDirectoryMock.mock.calls).toEqual([
                  ["/some-directory/some-project/node_modules/some-module"],
                  ["/some-directory/some-project/node_modules/some-other-module"],
                ]);
              });
            });

            describe("given Lens link directories does not exist", () => {
              beforeEach(async () => {
                await existsMock.resolve(false);
                await existsMock.resolve(false);
              });

              it("creates the Lens link directories", () => {
                expect(ensureDirectoryMock.mock.calls).toEqual([
                  ["/some-directory/some-project/node_modules/some-module"],
                  ["/some-directory/some-project/node_modules/some-other-module"],
                ]);
              });

              it("does not create symlinks yet", () => {
                expect(createSymlinkMock).not.toHaveBeenCalled();
              });

              describe("when creation of Lens link directories resolve", () => {
                beforeEach(async () => {
                  await ensureDirectoryMock.resolve();
                  await ensureDirectoryMock.resolve();
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
              });
            });
          });
        });
      });
    });

    xdescribe("normally", () => {
      it("checks for existence of package.jsons", () => {
        expect(existsMock.mock.calls).toEqual([["some-target-directory/package.json"]]);
      });

      it("when package.json for target directory is missing, throws", () => {
        existsMock.resolveSpecific(
          ([packageJsonPath]) => packageJsonPath === "some-target-directory/package.json",
          false,
        );

        existsMock.resolveSpecific(([packageJsonPath]) => packageJsonPath === "some-to-directory/package.json", true);

        return expect(actualPromise).rejects.toThrow(
          `Tried to link package but package.json is missing in "some-target-directory/package.json"`,
        );
      });

      it("when package.json for to directory is missing, throws", () => {
        existsMock.resolveSpecific(
          ([packageJsonPath]) => packageJsonPath === "some-target-directory/package.json",
          true,
        );

        existsMock.resolveSpecific(([packageJsonPath]) => packageJsonPath === "some-to-directory/package.json", false);

        return expect(actualPromise).rejects.toThrow(
          `Tried to link package but package.json is missing in "some-to-directory/package.json"`,
        );
      });

      it("when both package.jsons are missing, throws", () => {
        existsMock.resolveSpecific(
          ([packageJsonPath]) => packageJsonPath === "some-target-directory/package.json",
          false,
        );

        existsMock.resolveSpecific(([packageJsonPath]) => packageJsonPath === "some-to-directory/package.json", false);

        return expect(actualPromise).rejects.toThrow(
          `Tried to link package but package.jsons are missing in "some-target-directory/package.json", "some-to-directory/package.json"`,
        );
      });

      describe("when check for package.jsons resolves with both existing", () => {
        beforeEach(async () => {
          await existsMock.resolve(true);
          await existsMock.resolve(true);
        });

        it("reads the target package json", () => {
          expect(readJsonFileMock).toHaveBeenCalledWith("some-target-directory/package.json");
        });

        it("does not read the to package json", () => {
          expect(readJsonFileMock).not.toHaveBeenCalledWith("some-to-directory/package.json");
        });

        describe("when package json resolves with enough data", () => {
          beforeEach(async () => {
            existsMock.mockClear();

            await readJsonFileMock.resolve({
              name: "some-npm-package",
              main: "some-directory-in-package/some-entrypoint.js",
              files: ["some-directory-in-package", "some-other-directory-in-package"],

              irrelevant: "property",
            });
          });

          it("checks for existence of target npm package in node modules of the to-package", () => {
            expect(existsMock).toHaveBeenCalledWith("some-to-directory/node_modules/some-npm-package");
          });

          it("when check for existence of target npm package in node_modules resolves with existing directory, throws", () => {
            existsMock.resolve(true);

            // Note, this shouldn't throw, it should ask whether user wants to override existing
            return expect(actualPromise).rejects.toThrow("Asd");
          });

          describe("when check for existence of target npm package in node_modules resolves with non existing directory", () => {
            beforeEach(async () => {
              await existsMock.resolve(false);
            });

            it("ensures directory for the target npm package in node modules", () => {
              expect(ensureDirectoryMock).toHaveBeenCalledWith("some-to-directory/node_modules/some-npm-package");
            });

            describe("when ensuring directory resolves", () => {
              beforeEach(async () => {
                await ensureDirectoryMock.resolve();
              });

              it("creates minimal package.json in the node_modules", () => {
                expect(writeJsonFileMock).toHaveBeenCalledWith(
                  "some-to-directory/node_modules/some-npm-package/package.json",

                  {
                    name: "some-npm-package",
                    main: "some-directory-in-package/some-entrypoint.js",
                    files: ["some-directory-in-package", "some-other-directory-in-package"],
                  },
                );
              });

              it("creates the symlinks for the files or directories in package.json", () => {
                expect(createSymlinkMock.mock.calls).toEqual([
                  [
                    "some-target-directory/some-directory-in-package",
                    "some-to-directory/node_modules/some-npm-package/some-directory-in-package",
                    "dir",
                  ],
                  [
                    "some-target-directory/some-other-directory-in-package",
                    "some-to-directory/node_modules/some-npm-package/some-other-directory-in-package",
                    "dir",
                  ],
                ]);
              });

              it("does not resolve yet", async () => {
                const promiseStatus = await getPromiseStatus(actualPromise);

                expect(promiseStatus.fulfilled).toBe(false);
              });

              it("when creation files and symlinks resolve, resolves", async () => {
                writeJsonFileMock.resolve();
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
