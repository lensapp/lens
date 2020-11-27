import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { extensionDiscovery } from "../../../../extensions/extension-discovery";
import { Extensions } from "../extensions";

jest.mock("../../../../extensions/extension-discovery", () => ({
  ...jest.requireActual("../../../../extensions/extension-discovery"),
  extensionDiscovery: {
    localFolderPath: "/fake/path",
    uninstallExtension: jest.fn()
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
  it("disables uninstall and disable buttons while uninstalling", () => {
    render(<Extensions />);

    fireEvent.click(screen.getByText("Uninstall"));
    
    expect(extensionDiscovery.uninstallExtension).toHaveBeenCalledWith("/absolute/path");
    expect(screen.getByText("Disable").closest("button")).toBeDisabled();
    expect(screen.getByText("Uninstall").closest("button")).toBeDisabled();
  });
});
