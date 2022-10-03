/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { FSWatcher } from "chokidar";
import path from "path";
import os from "os";
import { Console } from "console";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import extensionDiscoveryInjectable from "../extension-discovery/extension-discovery.injectable";
import type { ExtensionDiscovery } from "../extension-discovery/extension-discovery";
import installExtensionInjectable from "../extension-installer/install-extension/install-extension.injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import mockFs from "mock-fs";
import { delay } from "../../renderer/utils";
import { observable, when } from "mobx";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import watchInjectable from "../../common/fs/watch/watch.injectable";
import extensionApiVersionInjectable from "../../common/vars/extension-api-version.injectable";

console = new Console(process.stdout, process.stderr); // fix mockFS

describe("ExtensionDiscovery", () => {
  let extensionDiscovery: ExtensionDiscovery;
  let readJsonFileMock: jest.Mock;
  let pathExistsMock: jest.Mock;
  let watchMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(installExtensionInjectable, () => () => Promise.resolve());
    di.override(extensionApiVersionInjectable, () => "5.0.0");

    readJsonFileMock = jest.fn();
    di.override(readJsonFileInjectable, () => readJsonFileMock);

    pathExistsMock = jest.fn(() => Promise.resolve(true));
    di.override(pathExistsInjectable, () => pathExistsMock);

    watchMock = jest.fn();
    di.override(watchInjectable, () => watchMock);

    mockFs();

    extensionDiscovery = di.inject(extensionDiscoveryInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("emits add for added extension", async () => {
    const letTestFinish = observable.box(false);
    let addHandler!: (filePath: string) => void;

    readJsonFileMock.mockImplementation((p) => {
      expect(p).toBe(path.join(os.homedir(), ".k8slens/extensions/my-extension/package.json"));

      return {
        name: "my-extension",
        version: "1.0.0",
        engines: {
          lens: "5.0.0",
        },
      };
    });

    const mockWatchInstance = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      }),
    } as unknown as FSWatcher;

    watchMock.mockImplementationOnce(() => mockWatchInstance);

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    extensionDiscovery.events.on("add", extension => {
      expect(extension).toEqual({
        absolutePath: expect.any(String),
        id: path.normalize("some-directory-for-user-data/node_modules/my-extension/package.json"),
        isBundled: false,
        isEnabled: false,
        isCompatible: true,
        manifest:  {
          name: "my-extension",
          version: "1.0.0",
          engines: {
            lens: "5.0.0",
          },
        },
        manifestPath: path.normalize("some-directory-for-user-data/node_modules/my-extension/package.json"),
      });
      letTestFinish.set(true);
    });

    addHandler(path.join(extensionDiscovery.localFolderPath, "/my-extension/package.json"));
    await when(() => letTestFinish.get());
  });

  it("doesn't emit add for added file under extension", async () => {
    let addHandler!: (filePath: string) => void;

    const mockWatchInstance = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      }),
    } as unknown as FSWatcher;

    watchMock.mockImplementationOnce(() => mockWatchInstance);

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(path.join(extensionDiscovery.localFolderPath, "/my-extension/node_modules/dep/package.json"));

    await delay(10);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
