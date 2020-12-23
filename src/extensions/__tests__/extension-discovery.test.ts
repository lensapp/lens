import { watch } from "chokidar";
import { join, normalize } from "path";
import { ExtensionDiscovery, InstalledExtension } from "../extension-discovery";
import { ExtensionsStore } from "../extensions-store";

jest.mock("../../common/ipc");
jest.mock("fs-extra");
jest.mock("chokidar", () => ({
  watch: jest.fn()
}));
jest.mock("../extension-installer", () => ({
  extensionInstaller: {
    extensionPackagesRoot: "",
    installPackage: jest.fn()
  }
}));

const mockedWatch = watch as jest.MockedFunction<typeof watch>;

describe("ExtensionDiscovery", () => {
  beforeEach(() => {
    ExtensionDiscovery.resetInstance();
    ExtensionsStore.resetInstance();
    ExtensionsStore.getInstanceOrCreate();
  });

  it("emits add for added extension", async done => {
    globalThis.__non_webpack_require__.mockImplementation(() => ({
      name: "my-extension"
    }));
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
    const extensionDiscovery = ExtensionDiscovery.getInstanceOrCreate();

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    extensionDiscovery.events.on("add", (extension: InstalledExtension) => {
      expect(extension).toEqual({
        absolutePath: expect.any(String),
        id: normalize("node_modules/my-extension/package.json"),
        isBundled: false,
        isEnabled: false,
        manifest:  {
          name: "my-extension",
        },
        manifestPath: normalize("node_modules/my-extension/package.json"),
      });
      done();
    });

    addHandler(join(extensionDiscovery.localFolderPath, "/my-extension/package.json"));
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
    const extensionDiscovery = ExtensionDiscovery.getInstanceOrCreate();

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.watchExtensions();

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(join(extensionDiscovery.localFolderPath, "/my-extension/node_modules/dep/package.json"));

    setTimeout(() => {
      expect(onAdd).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});
