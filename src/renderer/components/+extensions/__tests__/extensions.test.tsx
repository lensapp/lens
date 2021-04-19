import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import fse from "fs-extra";
import React from "react";
import { UserStore } from "../../../../common/user-store";
import { ExtensionDiscovery } from "../../../../extensions/extension-discovery";
import { ExtensionLoader } from "../../../../extensions/extension-loader";
import { ConfirmDialog } from "../../confirm-dialog";
import { ExtensionInstallationStateStore } from "../extension-install.store";
import { Extensions } from "../extensions";
import mockFs from "mock-fs";

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

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: (): void => void 0,
  }
}));

describe("Extensions", () => {
  beforeEach(async () => {
    mockFs({
      "tmp": {}
    });

    ExtensionInstallationStateStore.reset();
    UserStore.resetInstance();

    await UserStore.createInstance().load();

    ExtensionDiscovery.resetInstance();
    ExtensionDiscovery.createInstance().uninstallExtension = jest.fn(() => Promise.resolve());

    ExtensionLoader.resetInstance();
    ExtensionLoader.createInstance().addExtension({
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

  afterEach(() => {
    mockFs.restore();
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    ExtensionDiscovery.getInstance().isLoaded = true;

    const res = render(<><Extensions /><ConfirmDialog /></>);

    expect(res.getByText("Disable").closest("button")).not.toBeDisabled();
    expect(res.getByText("Uninstall").closest("button")).not.toBeDisabled();

    fireEvent.click(res.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(res.getByText("Yes"));

    await waitFor(() => {
      expect(ExtensionDiscovery.getInstance().uninstallExtension).toHaveBeenCalled();
      expect(res.getByText("Disable").closest("button")).toBeDisabled();
      expect(res.getByText("Uninstall").closest("button")).toBeDisabled();
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

  it("displays spinner while extensions are loading", () => {
    ExtensionDiscovery.getInstance().isLoaded = false;
    const { container } = render(<Extensions />);

    expect(container.querySelector(".Spinner")).toBeInTheDocument();
  });

  it("does not display the spinner while extensions are not loading", async () => {
    ExtensionDiscovery.getInstance().isLoaded = true;
    const { container } = render(<Extensions />);

    waitFor(() =>
      expect(container.querySelector(".Spinner")).not.toBeInTheDocument()
    );
  });
});
