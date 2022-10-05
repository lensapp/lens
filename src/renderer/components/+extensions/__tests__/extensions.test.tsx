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
import type { DeleteFile } from "../../../../common/fs/delete-file.injectable";
import deleteFileInjectable from "../../../../common/fs/delete-file.injectable";

jest.mock("../../notifications");

jest.mock("../../../../common/utils/downloadFile", () => ({
  downloadFile: jest.fn(({ url }) => ({
    promise: Promise.resolve(),
    url,
    cancel: () => {},
  })),
  downloadJson: jest.fn(({ url }) => ({
    promise: Promise.resolve({}),
    url,
    cancel: () => { },
  })),
}));

jest.mock("../../../../common/utils/tar");

describe("Extensions", () => {
  let extensionLoader: ExtensionLoader;
  let extensionDiscovery: ExtensionDiscovery;
  let installExtensionFromInput: jest.MockedFunction<InstallExtensionFromInput>;
  let extensionInstallationStateStore: ExtensionInstallationStateStore;
  let render: DiRender;
  let deleteFileMock: jest.MockedFunction<DeleteFile>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(directoryForDownloadsInjectable, () => "some-directory-for-downloads");

    render = renderFor(di);

    installExtensionFromInput = jest.fn();
    di.override(installExtensionFromInputInjectable, () => installExtensionFromInput);

    deleteFileMock = jest.fn();
    di.override(deleteFileInjectable, () => deleteFileMock);

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

    await waitFor(() => {
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
        value: "https://test.extensionurl/package.tgz",
      },
    });

    fireEvent.click(await screen.findByText("Install"));
    expect((await screen.findByText("Install")).closest("button")).toBeDisabled();
    resolveInstall.set(true);
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
