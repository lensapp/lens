import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { extensionDiscovery } from "../../../../extensions/extension-discovery";
import { ConfirmDialog } from "../../confirm-dialog";
import { Notifications } from "../../notifications";
import { Extensions } from "../extensions";

jest.mock("../../../../extensions/extension-discovery", () => ({
  ...jest.requireActual("../../../../extensions/extension-discovery"),
  extensionDiscovery: {
    localFolderPath: "/fake/path",
    uninstallExtension: jest.fn(() => Promise.resolve())
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

    setTimeout(() => {
      expect(screen.getByText("Disable").closest("button")).not.toBeDisabled();
      expect(screen.getByText("Uninstall").closest("button")).not.toBeDisabled();
      expect(Notifications.error).toHaveBeenCalledTimes(1);
    }, 100);
  });
});
