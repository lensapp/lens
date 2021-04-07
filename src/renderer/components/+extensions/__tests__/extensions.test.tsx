import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import fse from "fs-extra";
import React from "react";
import { extensionDiscovery } from "../../../../extensions/extension-discovery";
import { ConfirmDialog } from "../../confirm-dialog";
import { Notifications } from "../../notifications";
import { ExtensionInstallationStateStore } from "../extension-install.store";
import { Extensions } from "../extensions";

jest.setTimeout(30000);
jest.mock("fs-extra");
jest.mock("../../notifications");

jest.mock("../../../../common/utils", () => ({
  ...jest.requireActual("../../../../common/utils"),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve()
  })),
  extractTar: jest.fn(() => Promise.resolve())
}));

jest.mock("../../../../extensions/extension-discovery", () => ({
  ...jest.requireActual("../../../../extensions/extension-discovery"),
  extensionDiscovery: {
    localFolderPath: "/fake/path",
    uninstallExtension: jest.fn(() => Promise.resolve()),
    isLoaded: true
  }
}));

jest.mock("../../../../extensions/extension-loader", () => ({
  ...jest.requireActual("../../../../extensions/extension-loader"),
  extensionLoader: {
    userExtensions: new Map([
      ["extensionId", {
        id: "extensionId",
        manifest: {
          name: "test",
          version: "1.2.3"
        },
        absolutePath: "/absolute/path",
        manifestPath: "/symlinked/path/package.json",
        isBundled: false,
        isEnabled: true
      }]
    ])
  }
}));

describe("Extensions", () => {
  beforeEach(() => {
    ExtensionInstallationStateStore.reset();
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    const res = render(<><Extensions /><ConfirmDialog /></>);

    expect(res.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(res.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(res.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(res.getByText("Yes"));

    expect(extensionDiscovery.uninstallExtension).toHaveBeenCalled();
    expect(res.getByText("Disable").closest("button")).toBeDisabled();
    expect(res.getByText("Uninstall").closest("button")).toBeDisabled();
  });

  it("displays error notification on uninstall error", async () => {
    (extensionDiscovery.uninstallExtension as any).mockImplementationOnce(() =>
      Promise.reject()
    );
    const res = render(<><Extensions /><ConfirmDialog /></>);

    expect(res.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(res.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(res.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(res.getByText("Yes"));

    await waitFor(() => {
      expect(res.getByText("Disable").closest("button")).not.toBeDisabled();
      expect(res.getByText("Uninstall").closest("button")).not.toBeDisabled();
      expect(Notifications.error).toHaveBeenCalledTimes(1);
    }, {
      timeout: 30000,
    });
  });

  it("disables install button while installing", async () => {
    const res = render(<Extensions />);

    (fse.unlink as jest.MockedFunction<typeof fse.unlink>).mockReturnValue(Promise.resolve() as any);

    fireEvent.change(res.getByPlaceholderText("Path or URL to an extension package", {
      exact: false
    }), {
      target: {
        value: "https://test.extensionurl/package.tgz"
      }
    });

    fireEvent.click(res.getByText("Install"));
    expect(res.getByText("Install").closest("button")).toBeDisabled();
  });

  it("displays spinner while extensions are loading", async () => {
    extensionDiscovery.isLoaded = false;
    const res = render(<Extensions />);

    expect(res.container.querySelector(".Spinner")).toBeInTheDocument();
  });

  it("does not display the spinner while extensions are not loading", async () => {
    extensionDiscovery.isLoaded = true;
    const res = render(<Extensions />);

    expect(res.container.querySelector(".Spinner")).not.toBeInTheDocument();
  });
});
