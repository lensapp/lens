import { ExtensionLoader } from "../extension-loader";

const manifestPath = "manifest/path";
const manifestPath2 = "manifest/path2";
const manifestPath3 = "manifest/path3";

jest.mock(
  "electron",
  () => ({
    ipcRenderer: {
      invoke: jest.fn(async (channel: string, ...args: any[]) => {
        if (channel === "extensions:loaded") {
          return [
            [
              manifestPath,
              {
                manifest: {
                  name: "TestExtension",
                  version: "1.0.0",
                },
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
          if (channel === "extensions:loaded") {
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
                    manifestPath3,
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
            "isBundled": false,
            "isEnabled": true,
            "manifest": Object {
              "name": "TestExtension",
              "version": "1.0.0",
            },
            "manifestPath": "manifest/path",
          },
          "manifest/path3" => Object {
            "isBundled": false,
            "isEnabled": true,
            "manifest": Object {
              "name": "TestExtension3",
              "version": "3.0.0",
            },
            "manifestPath3": "manifest/path3",
          },
        }
      `);

      done();
    }, 10);
  });
});
