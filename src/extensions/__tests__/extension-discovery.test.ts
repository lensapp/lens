import mockFs from "mock-fs";
import { watch } from "chokidar";
import { ExtensionsStore } from "../extensions-store";
import path from "path";
import { ExtensionDiscovery } from "../extension-discovery";
import os from "os";
import { Console } from "console";

jest.setTimeout(60_000);

jest.mock("../../common/ipc");
jest.mock("chokidar", () => ({
  watch: jest.fn()
}));
jest.mock("../extension-installer", () => ({
  extensionInstaller: {
    extensionPackagesRoot: "",
    installPackage: jest.fn()
  }
}));

console = new Console(process.stdout, process.stderr); // fix mockFS
const mockedWatch = watch as jest.MockedFunction<typeof watch>;

describe("ExtensionDiscovery", () => {
  beforeEach(() => {
    ExtensionDiscovery.resetInstance();
    ExtensionsStore.resetInstance();
    ExtensionsStore.createInstance();
  });

  describe("with mockFs", () => {
    beforeEach(() => {
      mockFs({
        [`${os.homedir()}/.k8slens/extensions/my-extension/package.json`]: JSON.stringify({
          name: "my-extension"
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
        })
      };

      mockedWatch.mockImplementationOnce(() =>
        (mockWatchInstance) as any
      );

      const extensionDiscovery = ExtensionDiscovery.createInstance();

      // Need to force isLoaded to be true so that the file watching is started
      extensionDiscovery.isLoaded = true;

      await extensionDiscovery.watchExtensions();

      extensionDiscovery.events.on("add", extension => {
        expect(extension).toEqual({
          absolutePath: expect.any(String),
          id: path.normalize("node_modules/my-extension/package.json"),
          isBundled: false,
          isEnabled: false,
          manifest:  {
            name: "my-extension",
          },
          manifestPath: path.normalize("node_modules/my-extension/package.json"),
        });
        done();
      });

      addHandler(path.join(extensionDiscovery.localFolderPath, "/my-extension/package.json"));
    });
  });

  it("doesn't emit add for added file under extension", async done => {
    let addHandler: (filePath: string) => void;

    const mockWatchInstance: any = {
      on: jest.fn((event: string, handler: typeof addHandler) => {
        if (event === "add") {
          addHandler = handler;
        }

        return mockWatchInstance;
      })
    };

    mockedWatch.mockImplementationOnce(() =>
      (mockWatchInstance) as any
    );
    const extensionDiscovery = ExtensionDiscovery.createInstance();

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
