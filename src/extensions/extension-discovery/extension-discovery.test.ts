/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import mockFs from "mock-fs";
import { watch } from "chokidar";
import path from "path";
import type { ExtensionDiscovery } from "./extension-discovery";
import os from "os";
import { Console } from "console";
import { AppPaths } from "../../common/app-paths";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import extensionDiscoveryInjectable from "./extension-discovery.injectable";
import extensionPackageRootDirectoryInjectable from "../extension-installer/extension-package-root-directory/extension-package-root-directory.injectable";
import installExtensionInjectable from "../extension-installer/install-extension/install-extension.injectable";

jest.setTimeout(60_000);

jest.mock("../../common/ipc");
jest.mock("chokidar", () => ({
  watch: jest.fn(),
}));
jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

AppPaths.init();

console = new Console(process.stdout, process.stderr); // fix mockFS
const mockedWatch = watch as jest.MockedFunction<typeof watch>;

describe("ExtensionDiscovery", () => {
  let extensionDiscovery: ExtensionDiscovery;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(installExtensionInjectable, () => () => Promise.resolve());

    di.override(
      extensionPackageRootDirectoryInjectable,
      () => "some-extension-packages-root",
    );

    extensionDiscovery = di.inject(extensionDiscoveryInjectable);
  });

  describe("with mockFs", () => {
    beforeEach(() => {
      mockFs({
        [`${os.homedir()}/.k8slens/extensions/my-extension/package.json`]:
          JSON.stringify({
            name: "my-extension",
          }),
      });
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("emits add for added extension", async (done) => {
      let addHandler: (filePath: string) => void;

      const mockWatchInstance: any = {
        on: jest.fn((event: string, handler: typeof addHandler) => {
          if (event === "add") {
            addHandler = handler;
          }

          return mockWatchInstance;
        }),
      };

      mockedWatch.mockImplementationOnce(() => mockWatchInstance as any);

      // Need to force isLoaded to be true so that the file watching is started
      extensionDiscovery.isLoaded = true;

      await extensionDiscovery.watchExtensions();

      extensionDiscovery.events.on("add", (extension) => {
        expect(extension).toEqual({
          absolutePath: expect.any(String),
          id: path.normalize(
            "some-extension-packages-root/node_modules/my-extension/package.json",
          ),
          isBundled: false,
          isEnabled: false,
          isCompatible: false,
          manifest: {
            name: "my-extension",
          },
          manifestPath: path.normalize(
            "some-extension-packages-root/node_modules/my-extension/package.json",
          ),
        });

        done();
      });

      addHandler(
        path.join(
          extensionDiscovery.localFolderPath,
          "/my-extension/package.json",
        ),
      );
    });
  });

  it("doesn't emit add for added file under extension", async (done) => {
    let addHandler: (filePath: string) => void;

    const mockWatchInstance: any = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      }),
    };

    mockedWatch.mockImplementationOnce(() => mockWatchInstance as any);

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(
      path.join(
        extensionDiscovery.localFolderPath,
        "/my-extension/node_modules/dep/package.json",
      ),
    );

    setTimeout(() => {
      expect(onAdd).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});
