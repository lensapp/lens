/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { FSWatcher } from "chokidar";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import extensionDiscoveryInjectable from "../extension-discovery/extension-discovery.injectable";
import type { ExtensionDiscovery } from "../extension-discovery/extension-discovery";
import installExtensionInjectable from "../extension-installer/install-extension/install-extension.injectable";
import { delay } from "../../renderer/utils";
import readJsonFileInjectable from "../../common/fs/read-json-file.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import watchInjectable from "../../common/fs/watch/watch.injectable";
import extensionApiVersionInjectable from "../../common/vars/extension-api-version.injectable";
import removePathInjectable from "../../common/fs/remove-path.injectable";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import homeDirectoryPathInjectable from "../../common/os/home-directory-path.injectable";
import { runManyFor } from "../../common/runnable/run-many-for";
import { runManySyncFor } from "../../common/runnable/run-many-sync-for";
import { beforeApplicationIsLoadingInjectionToken } from "../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import { beforeElectronIsReadyInjectionToken } from "../../main/start-main-application/runnable-tokens/before-electron-is-ready-injection-token";

describe("ExtensionDiscovery", () => {
  let extensionDiscovery: ExtensionDiscovery;
  let readJsonFileMock: jest.Mock;
  let pathExistsMock: jest.Mock;
  let watchMock: jest.Mock;
  let joinPaths: JoinPaths;
  let homeDirectoryPath: string;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(installExtensionInjectable, () => () => Promise.resolve());
    di.override(extensionApiVersionInjectable, () => "5.0.0");

    const runManySync = runManySyncFor(di);
    const runMany = runManyFor(di);
    const runAllBeforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);
    const runAllBeforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);

    runAllBeforeElectronIsReady();
    await runAllBeforeApplicationIsLoading();

    joinPaths = di.inject(joinPathsInjectable);
    homeDirectoryPath = di.inject(homeDirectoryPathInjectable);

    readJsonFileMock = jest.fn();
    di.override(readJsonFileInjectable, () => readJsonFileMock);

    pathExistsMock = jest.fn(() => Promise.resolve(true));
    di.override(pathExistsInjectable, () => pathExistsMock);

    watchMock = jest.fn();
    di.override(watchInjectable, () => watchMock);

    di.override(removePathInjectable, () => async () => {}); // allow deleting files for now

    extensionDiscovery = di.inject(extensionDiscoveryInjectable);
  });

  it("emits add for added extension", async () => {
    let addHandler!: (filePath: string) => void;

    readJsonFileMock.mockImplementation((p) => {
      expect(p).toBe(joinPaths(homeDirectoryPath, ".k8slens/extensions/my-extension/package.json"));

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

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(joinPaths(extensionDiscovery.localFolderPath, "/my-extension/package.json"));
    await delay(10);
    expect(onAdd).toBeCalledWith({
      absolutePath: "/some-home-directory/.k8slens/extensions/my-extension",
      id: "/some-electron-app-path-for-user-data/node_modules/my-extension/package.json",
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
      manifestPath: "/some-electron-app-path-for-user-data/node_modules/my-extension/package.json",
    });
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

    addHandler(joinPaths(extensionDiscovery.localFolderPath, "/my-extension/node_modules/dep/package.json"));

    await delay(10);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
