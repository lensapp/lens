/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ExtensionLoader } from "../extension-loader";
import { Console } from "console";
import { stdout, stderr } from "process";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import { runInAction } from "mobx";
import updateExtensionsStateInjectable
  from "../extension-loader/update-extensions-state/update-extensions-state.injectable";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";
import mockFs from "mock-fs";

console = new Console(stdout, stderr);

const manifestPath = "manifest/path";
const manifestPath2 = "manifest/path2";
const manifestPath3 = "manifest/path3";

jest.mock(
  "electron",
  () => ({
    ipcRenderer: {
      invoke: jest.fn((channel: string) => {
        if (channel === "extensions:main") {
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
      on: jest.fn(
        (channel: string, listener: (event: any, ...args: any[]) => void) => {
          if (channel === "extensions:main") {
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
      ),
    },
  }),
  {
    virtual: true,
  },
);

describe("ExtensionLoader", () => {
  let extensionLoader: ExtensionLoader;
  let updateExtensionStateMock: jest.Mock;

  beforeEach(async () => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    updateExtensionStateMock = jest.fn();

    dis.mainDi.override(updateExtensionsStateInjectable, () => updateExtensionStateMock);

    await dis.runSetups();

    extensionLoader = dis.mainDi.inject(extensionLoaderInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("renderer updates extension after ipc broadcast", async done => {
    expect(extensionLoader.userExtensions).toMatchInlineSnapshot(`Map {}`);

    await extensionLoader.init();

    setTimeout(() => {
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

      done();
    }, 10);
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
