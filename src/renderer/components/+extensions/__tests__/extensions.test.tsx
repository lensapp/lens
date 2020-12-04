import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import fse from "fs-extra";
import React from "react";
import { extensionDiscovery } from "../../../../extensions/extension-discovery";
import { ConfirmDialog } from "../../confirm-dialog";
import { Notifications } from "../../notifications";
import { ExtensionStateStore } from "../extension-install.store";
import { Extensions } from "../extensions";

jest.mock("fs-extra");

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

jest.mock("../../notifications", () => ({
  ok: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

describe("Extensions", () => {
  beforeEach(() => {
    ExtensionStateStore.resetInstance();
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    render(<><Extensions /><ConfirmDialog/></>);

    expect(screen.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(screen.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(screen.getByText("Yes"));

    expect(extensionDiscovery.uninstallExtension).toHaveBeenCalledWith("/absolute/path");
    expect(screen.getByText("Disable").closest("button")).toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).toBeDisabled();
  });

  it("displays error notification on uninstall error", () => {
    (extensionDiscovery.uninstallExtension as any).mockImplementationOnce(() =>
      Promise.reject()
    );
    render(<><Extensions /><ConfirmDialog/></>);

    expect(screen.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(screen.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(screen.getByText("Yes"));

    waitFor(() => {
      expect(screen.getByText("Disable").closest("button")).not.toBeDisabled();
      expect(screen.getByText("Uninstall").closest("button")).not.toBeDisabled();
      expect(Notifications.error).toHaveBeenCalledTimes(1);
    });
  });

  it("disables install button while installing", () => {
    render(<Extensions />);

    fireEvent.change(screen.getByPlaceholderText("Path or URL to an extension package", {
      exact: false
    }), {
      target: {
        value: "https://test.extensionurl/package.tgz"
      }
    });

    fireEvent.click(screen.getByText("Install"));

    waitFor(() => {
      expect(screen.getByText("Install").closest("button")).toBeDisabled();
      expect(fse.move).toHaveBeenCalledWith("");
      expect(Notifications.error).not.toHaveBeenCalled();
    });
  });

  it("displays spinner while extensions are loading", () => {
    extensionDiscovery.isLoaded = false;
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).toBeInTheDocument();

    extensionDiscovery.isLoaded = true;

    waitFor(() => 
      expect(container.querySelector(".Spinner")).not.toBeInTheDocument()
    );
  });
});
