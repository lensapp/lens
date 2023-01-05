/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ExtensionLoader } from "../extension-loader";
import { Console } from "console";
import { stdout, stderr } from "process";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import { runInAction } from "mobx";
import updateExtensionsStateInjectable from "../extension-loader/update-extensions-state/update-extensions-state.injectable";
import mockFs from "mock-fs";
import { delay } from "../../renderer/utils";
import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import ipcRendererInjectable from "../../renderer/utils/channel/ipc-renderer.injectable";
import type { IpcRenderer } from "electron";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import currentlyInClusterFrameInjectable from "../../renderer/routes/currently-in-cluster-frame.injectable";

console = new Console(stdout, stderr);

const manifestPath = "manifest/path";
const manifestPath2 = "manifest/path2";
const manifestPath3 = "manifest/path3";

describe("ExtensionLoader", () => {
  let extensionLoader: ExtensionLoader;
  let updateExtensionStateMock: jest.Mock;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");
    di.override(currentlyInClusterFrameInjectable, () => false);

    di.override(ipcRendererInjectable, () => ({
      invoke: jest.fn(async (channel: string) => {
        if (channel === "extension-loader:main:state") {
          return [
            [
              manifestPath,
              {
                manifest: {
                  name: "TestExtension",
                  version: "1.0.0",
                },
                id: manifestPath,
                absolutePath: "/test/1",
                manifestPath,
                isBundled: false,
                isEnabled: true,
              },
            ],
            [
              manifestPath2,
              {
                manifest: {
                  name: "TestExtension2",
                  version: "2.0.0",
                },
                id: manifestPath2,
                absolutePath: "/test/2",
                manifestPath: manifestPath2,
                isBundled: false,
                isEnabled: true,
              },
            ],
          ];
        }

        return [];
      }),

      on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
        if (channel === "extension-loader:main:state") {
          // First initialize with extensions 1 and 2
          // and then broadcast event to remove extension 2 and add extension number 3
          setTimeout(() => {
            listener({}, [
              [
                manifestPath,
                {
                  manifest: {
                    name: "TestExtension",
                    version: "1.0.0",
                  },
                  id: manifestPath,
                  absolutePath: "/test/1",
                  manifestPath,
                  isBundled: false,
                  isEnabled: true,
                },
              ],
              [
                manifestPath3,
                {
                  manifest: {
                    name: "TestExtension3",
                    version: "3.0.0",
                  },
                  id: manifestPath3,
                  absolutePath: "/test/3",
                  manifestPath: manifestPath3,
                  isBundled: false,
                  isEnabled: true,
                },
              ],
            ]);
          }, 10);
        }
      },
    }) as unknown as IpcRenderer);

    mockFs();

    updateExtensionStateMock = jest.fn();

    di.override(updateExtensionsStateInjectable, () => updateExtensionStateMock);

    extensionLoader = di.inject(extensionLoaderInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("renderer updates extension after ipc broadcast", async () => {
    expect(extensionLoader.userExtensions).toMatchInlineSnapshot(`Map {}`);

    await extensionLoader.init();
    await delay(10);

    // Assert the extensions after the extension broadcast event
    expect(extensionLoader.userExtensions).toMatchInlineSnapshot(`
      Map {
        "manifest/path" => Object {
          "absolutePath": "/test/1",
          "id": "manifest/path",
          "isBundled": false,
          "isEnabled": true,
          "manifest": Object {
            "name": "TestExtension",
            "version": "1.0.0",
          },
          "manifestPath": "manifest/path",
        },
        "manifest/path3" => Object {
          "absolutePath": "/test/3",
          "id": "manifest/path3",
          "isBundled": false,
          "isEnabled": true,
          "manifest": Object {
            "name": "TestExtension3",
            "version": "3.0.0",
          },
          "manifestPath": "manifest/path3",
        },
      }
    `);
  });

  it("updates ExtensionsStore after isEnabled is changed", async () => {
    await extensionLoader.init();

    expect(updateExtensionStateMock).not.toHaveBeenCalled();

    runInAction(() => {
      extensionLoader.setIsEnabled("manifest/path", false);
    });

    expect(updateExtensionStateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        "manifest/path": {
          enabled: false,
          name: "TestExtension",
        },

        "manifest/path2": {
          enabled: true,
          name: "TestExtension2",
        },
      }),
    );
  });
});
