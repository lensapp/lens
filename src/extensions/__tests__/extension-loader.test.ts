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

import { ExtensionLoader } from "../extension-loader";
import { ipcRenderer } from "electron";
import { ExtensionsStore } from "../extensions-store";
import { Console } from "console";
import { stdout, stderr } from "process";

console = new Console(stdout, stderr);

const manifestPath = "manifest/path";
const manifestPath2 = "manifest/path2";
const manifestPath3 = "manifest/path3";

jest.mock("../extensions-store", () => ({
  ExtensionsStore: {
    getInstance: () => ({
      whenLoaded: Promise.resolve(true),
      mergeState: jest.fn(),
    }),
  },
}));

jest.mock(
  "electron",
  () => ({
    ipcRenderer: {
      invoke: jest.fn(async (channel: string) => {
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
  beforeEach(() => {
    ExtensionLoader.resetInstance();
  });

  it.only("renderer updates extension after ipc broadcast", async (done) => {
    const extensionLoader = ExtensionLoader.createInstance();

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
    (ExtensionsStore.getInstance().mergeState as any).mockClear();

    // Disable sending events in this test
    (ipcRenderer.on as any).mockImplementation();

    const extensionLoader = ExtensionLoader.createInstance();

    await extensionLoader.init();

    expect(ExtensionsStore.getInstance().mergeState).not.toHaveBeenCalled();

    Array.from(extensionLoader.userExtensions.values())[0].isEnabled = false;

    expect(ExtensionsStore.getInstance().mergeState).toHaveBeenCalledWith({
      "manifest/path": {
        enabled: false,
        name: "TestExtension",
      },
      "manifest/path2": {
        enabled: true,
        name: "TestExtension2",
      }});
  });
});
