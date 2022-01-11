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

import { watch } from "chokidar";
import { ExtensionsStore } from "../extensions-store";
import path from "path";
import { ExtensionDiscovery } from "../extension-discovery";
import os from "os";
import { Console } from "console";
import { AppPaths } from "../../common/app-paths";
import type { ExtensionLoader } from "../extension-loader";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import * as fse from "fs-extra";

jest.setTimeout(60_000);

jest.mock("../../common/ipc");
jest.mock("chokidar", () => ({
  watch: jest.fn(),
}));
jest.mock("../extension-installer", () => ({
  extensionInstaller: {
    extensionPackagesRoot: "",
    installPackage: jest.fn(),
  },
}));
jest.mock("fs-extra");
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
const mockedFse = fse as jest.Mocked<typeof fse>;

describe("ExtensionDiscovery", () => {
  let extensionLoader: ExtensionLoader;

  beforeEach(() => {
    ExtensionDiscovery.resetInstance();
    ExtensionsStore.resetInstance();
    ExtensionsStore.createInstance();

    const di = getDiForUnitTesting();

    extensionLoader = di.inject(extensionLoaderInjectable);
  });

  it("emits add for added extension", async (done) => {
    let addHandler: (filePath: string) => void;

    mockedFse.readJson.mockImplementation((p) => {
      expect(p).toBe(path.join(os.homedir(), ".k8slens/extensions/my-extension/package.json"));

      return {
        name: "my-extension",
        version: "1.0.0",
      };
    });

    mockedFse.pathExists.mockImplementation(() => true);

    const mockWatchInstance: any = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      }),
    };

    mockedWatch.mockImplementationOnce(() =>
        (mockWatchInstance) as any,
    );
    const extensionDiscovery = ExtensionDiscovery.createInstance(
      extensionLoader,
    );

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    extensionDiscovery.events.on("add", extension => {
      expect(extension).toEqual({
        absolutePath: expect.any(String),
        id: path.normalize("node_modules/my-extension/package.json"),
        isBundled: false,
        isEnabled: false,
        isCompatible: false,
        manifest:  {
          name: "my-extension",
          version: "1.0.0",
        },
        manifestPath: path.normalize("node_modules/my-extension/package.json"),
      });
      done();
    });

    addHandler(path.join(extensionDiscovery.localFolderPath, "/my-extension/package.json"));
  });

  it("doesn't emit add for added file under extension", async done => {
    let addHandler: (filePath: string) => void;

    const mockWatchInstance: any = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      }),
    };

    mockedWatch.mockImplementationOnce(() =>
        (mockWatchInstance) as any,
    );
    const extensionDiscovery = ExtensionDiscovery.createInstance(
      extensionLoader,
    );

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(path.join(extensionDiscovery.localFolderPath, "/my-extension/node_modules/dep/package.json"));

    setTimeout(() => {
      expect(onAdd).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});

