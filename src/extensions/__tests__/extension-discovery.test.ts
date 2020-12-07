import { watch } from "chokidar";
import { ExtensionDiscovery, InstalledExtension } from "../extension-discovery";

jest.mock("../../common/ipc");
jest.mock("fs-extra");
jest.mock("chokidar", () => ({
  watch: jest.fn()
}));
jest.mock("../extension-installer", () => ({
  extensionInstaller: {
    extensionPackagesRoot: "",
    installPackages: jest.fn()
  }
}));

const mockedWatch = watch as jest.MockedFunction<typeof watch>;

describe("ExtensionDiscovery", () => {
  it("emits add for added extension", async done => {
    globalThis.__non_webpack_require__.mockImplementationOnce(() => ({
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
    const extensionDiscovery = new ExtensionDiscovery();

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.initMain();

    extensionDiscovery.events.on("add", (extension: InstalledExtension) => {
      expect(extension).toEqual({
        absolutePath: "/Users/phorsmalahti/.k8slens/extensions/my-extension",
        id: "node_modules/my-extension/package.json",
        isBundled: false,
        isEnabled: false,
        manifest:  {
          name: "my-extension",
        },
        manifestPath: "node_modules/my-extension/package.json",
      });
      done();
    });

    addHandler(`${extensionDiscovery.localFolderPath}/my-extension/package.json`);
  });

  it("doesn't emit add for added file under extension", async done => {
    globalThis.__non_webpack_require__.mockImplementationOnce(() => ({
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
    const extensionDiscovery = new ExtensionDiscovery();

    // Need to force isLoaded to be true so that the file watching is started
    extensionDiscovery.isLoaded = true;

    await extensionDiscovery.initMain();

    const onAdd = jest.fn();

    extensionDiscovery.events.on("add", onAdd);

    addHandler(`${extensionDiscovery.localFolderPath}/my-extension/node_modules/dep/package.json`);

    setTimeout(() => {
      expect(onAdd).not.toHaveBeenCalled();
      done();
    }, 10);
  });
});
