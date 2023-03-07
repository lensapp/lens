/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import type { ExtensionDiscovery } from "../../../../extensions/extension-discovery/extension-discovery";
import type { ExtensionLoader } from "../../../../extensions/extension-loader";
import { ConfirmDialog } from "../../confirm-dialog";
import { Extensions } from "../extensions";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import extensionDiscoveryInjectable from "../../../../extensions/extension-discovery/extension-discovery.injectable";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import directoryForDownloadsInjectable from "../../../../common/app-paths/directory-for-downloads/directory-for-downloads.injectable";
import assert from "assert";
import type { InstallExtensionFromInput } from "../install-extension-from-input.injectable";
import installExtensionFromInputInjectable from "../install-extension-from-input.injectable";
import type { ExtensionInstallationStateStore } from "../../../../extensions/extension-installation-state-store/extension-installation-state-store";
import extensionInstallationStateStoreInjectable from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import { observable, when } from "mobx";
import type { RemovePath } from "../../../../common/fs/remove.injectable";
import removePathInjectable from "../../../../common/fs/remove.injectable";
import type { DownloadBinary } from "../../../../common/fetch/download-binary.injectable";
import downloadBinaryInjectable from "../../../../common/fetch/download-binary.injectable";
import currentlyInClusterFrameInjectable from "../../../routes/currently-in-cluster-frame.injectable";

describe("Extensions", () => {
  let extensionLoader: ExtensionLoader;
  let extensionDiscovery: ExtensionDiscovery;
  let installExtensionFromInput: jest.MockedFunction<InstallExtensionFromInput>;
  let extensionInstallationStateStore: ExtensionInstallationStateStore;
  let render: DiRender;
  let deleteFileMock: jest.MockedFunction<RemovePath>;
  let downloadBinary: jest.MockedFunction<DownloadBinary>;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForDownloadsInjectable, () => "some-directory-for-downloads");
    di.override(currentlyInClusterFrameInjectable, () => false);

    render = renderFor(di);

    installExtensionFromInput = jest.fn();
    di.override(installExtensionFromInputInjectable, () => installExtensionFromInput);

    deleteFileMock = jest.fn();
    di.override(removePathInjectable, () => deleteFileMock);

    downloadBinary = jest.fn().mockImplementation((url) => { throw new Error(`Unexpected call to downloadJson for url=${url}`); });
    di.override(downloadBinaryInjectable, () => downloadBinary);

    extensionLoader = di.inject(extensionLoaderInjectable);
    extensionDiscovery = di.inject(extensionDiscoveryInjectable);
    extensionInstallationStateStore = di.inject(extensionInstallationStateStoreInjectable);

    extensionLoader.addExtension({
      id: "extensionId",
      manifest: {
        name: "test",
        version: "1.2.3",
        engines: { lens: "^5.5.0" },
      },
      absolutePath: "/absolute/path",
      manifestPath: "/symlinked/path/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });

    extensionDiscovery.uninstallExtension = jest.fn(() => Promise.resolve());
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    extensionDiscovery.isLoaded = true;

    render((
      <>
        <Extensions />
        <ConfirmDialog />
      </>
    ));

    const table = await screen.findByTestId("extensions-table");
    const menuTrigger = table.querySelector(".table div[role='rowgroup'] .actions .Icon");

    assert(menuTrigger);
    fireEvent.click(menuTrigger);

    expect(await screen.findByText("Disable")).toHaveAttribute("aria-disabled", "false");
    expect(await screen.findByText("Uninstall")).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(await screen.findByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(await screen.findByText("Yes"));

    await waitFor(async () => {
      expect(extensionDiscovery.uninstallExtension).toHaveBeenCalled();
      fireEvent.click(menuTrigger);
      expect(screen.getByText("Disable")).toHaveAttribute("aria-disabled", "true");
      expect(screen.getByText("Uninstall")).toHaveAttribute("aria-disabled", "true");
    }, {
      timeout: 30000,
    });
  });

  it("disables install button while installing", async () => {
    render(<Extensions />);

    const resolveInstall = observable.box(false);
    const url = "https://test.extensionurl/package.tgz";

    deleteFileMock.mockReturnValue(Promise.resolve());
    installExtensionFromInput.mockImplementation(async (input) => {
      expect(input).toBe("https://test.extensionurl/package.tgz");

      const clear = extensionInstallationStateStore.startPreInstall();

      await when(() => resolveInstall.get());
      clear();
    });

    fireEvent.change(await screen.findByPlaceholderText("File path or URL", {
      exact: false,
    }), {
      target: {
        value: url,
      },
    });

    const doResolve = observable.box(false);

    downloadBinary.mockImplementation(async (targetUrl) => {
      expect(targetUrl).toBe(url);

      await when(() => doResolve.get());

      return {
        callWasSuccessful: false,
        error: "unknown location",
      };
    });

    fireEvent.click(await screen.findByText("Install"));
    expect((await screen.findByText("Install")).closest("button")).toBeDisabled();
    doResolve.set(true);
  });

  it("displays spinner while extensions are loading", () => {
    extensionDiscovery.isLoaded = false;
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).toBeInTheDocument();
  });

  it("does not display the spinner while extensions are not loading", async () => {
    extensionDiscovery.isLoaded = true;
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).not.toBeInTheDocument();
  });
});
