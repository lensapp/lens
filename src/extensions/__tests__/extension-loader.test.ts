import { ExtensionLoader } from "../extension-loader";
import { ipcRenderer } from "electron";
import { extensionsStore } from "../extensions-store";

const manifestPath = "manifest/path";
const manifestPath2 = "manifest/path2";
const manifestPath3 = "manifest/path3";

jest.mock("../extensions-store", () => ({
  extensionsStore: {
    whenLoaded: Promise.resolve(true),
    mergeState: jest.fn()
  }
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
      }),
      on: jest.fn(
        (channel: string, listener: (event: any, ...args: any[]) => void) => {
          if (channel === "extensions:main") {
            // First initialize with extensions 1 and 2
            // and then broadcast event to remove extensioin 2 and add extension number 3
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
        }
      ),
    },
  }),
  {
    virtual: true,
  }
);

describe("ExtensionLoader", () => {
  it("renderer updates extension after ipc broadcast", async (done) => {
    const extensionLoader = new ExtensionLoader();

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
    (extensionsStore.mergeState as any).mockClear();

    // Disable sending events in this test
    (ipcRenderer.on as any).mockImplementation();

    const extensionLoader = new ExtensionLoader();

    await extensionLoader.init();

    expect(extensionsStore.mergeState).not.toHaveBeenCalled();

    Array.from(extensionLoader.userExtensions.values())[0].isEnabled = false;

    expect(extensionsStore.mergeState).toHaveBeenCalledWith({
      "manifest/path": {
        enabled: false,
        name: "TestExtension"
      },
      "manifest/path2": {
        enabled: true,
        name: "TestExtension2"
      }});
  });
});
