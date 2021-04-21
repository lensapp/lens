import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import fse from "fs-extra";
import React from "react";
import { UserStore } from "../../../../common/user-store";
import { ExtensionDiscovery } from "../../../../extensions/extension-discovery";
import { ExtensionLoader } from "../../../../extensions/extension-loader";
import { ThemeStore } from "../../../theme.store";
import { ConfirmDialog } from "../../confirm-dialog";
import { Notifications } from "../../notifications";
import { Extensions } from "../extensions";

jest.mock("fs-extra");

jest.mock("../../../../common/utils", () => ({
  ...jest.requireActual("../../../../common/utils"),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve()
  })),
  extractTar: jest.fn(() => Promise.resolve())
}));

jest.mock("../../notifications", () => ({
  ok: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

jest.mock("electron", () => {
  return {
    app: {
      getVersion: () => "99.99.99",
      getPath: () => "tmp",
      getLocale: () => "en",
      setLoginItemSettings: (): void => void 0,
    }
  };
});

describe("Extensions", () => {
  beforeEach(async () => {
    UserStore.resetInstance();
    ThemeStore.resetInstance();

    await UserStore.getInstanceOrCreate().load();
    await ThemeStore.getInstanceOrCreate().init();

    ExtensionLoader.resetInstance();
    ExtensionDiscovery.resetInstance();
    Extensions.installStates.clear();

    ExtensionDiscovery.getInstanceOrCreate().uninstallExtension = jest.fn(() => Promise.resolve());

    ExtensionLoader.getInstanceOrCreate().addExtension({
      id: "extensionId",
      manifest: {
        name: "test",
        version: "1.2.3"
      },
      absolutePath: "/absolute/path",
      manifestPath: "/symlinked/path/package.json",
      isBundled: false,
      isEnabled: true
    });
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    ExtensionDiscovery.getInstance().isLoaded = true;
    render(<><Extensions /><ConfirmDialog/></>);

    expect(screen.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(screen.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(screen.getByText("Yes"));

    expect(ExtensionDiscovery.getInstance().uninstallExtension).toHaveBeenCalled();
    expect(screen.getByText("Disable").closest("button")).toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).toBeDisabled();
  });

  it("displays error notification on uninstall error", () => {
    ExtensionDiscovery.getInstance().isLoaded = true;
    (ExtensionDiscovery.getInstance().uninstallExtension as any).mockImplementationOnce(() =>
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
    ExtensionDiscovery.getInstance().isLoaded = false;
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).toBeInTheDocument();

    ExtensionDiscovery.getInstance().isLoaded = true;

    waitFor(() =>
      expect(container.querySelector(".Spinner")).not.toBeInTheDocument()
    );
  });
});
