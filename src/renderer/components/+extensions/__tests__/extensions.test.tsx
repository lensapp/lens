/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
import { mockWindow } from "../../../../../__mocks__/windowMock";
import { AppPaths } from "../../../../common/app-paths";

mockWindow();

jest.setTimeout(30000);
jest.mock("fs-extra");
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

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

AppPaths.init();

describe("Extensions", () => {
  beforeEach(async () => {
    mockFs({
      "tmp": {},
    });

    ExtensionInstallationStateStore.reset();

    ExtensionLoader.createInstance().addExtension({
      id: "extensionId",
      manifest: {
        name: "test",
        version: "1.2.3",
      },
      absolutePath: "/absolute/path",
      manifestPath: "/symlinked/path/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });
    ExtensionDiscovery.createInstance().uninstallExtension = jest.fn(() => Promise.resolve());
    UserStore.createInstance();
  });

  afterEach(() => {
    mockFs.restore();
    UserStore.resetInstance();
    ExtensionDiscovery.resetInstance();
    ExtensionLoader.resetInstance();
  });

  it("disables uninstall and disable buttons while uninstalling", async () => {
    ExtensionDiscovery.getInstance().isLoaded = true;

    const res = render(<><Extensions /><ConfirmDialog /></>);
    const table = res.getByTestId("extensions-table");
    const menuTrigger = table.querySelector("div[role=row]:first-of-type .actions .Icon");

    fireEvent.click(menuTrigger);

    expect(res.getByText("Disable")).toHaveAttribute("aria-disabled", "false");
    expect(res.getByText("Uninstall")).toHaveAttribute("aria-disabled", "false");

    fireEvent.click(res.getByText("Uninstall"));

    // Approve confirm dialog
    fireEvent.click(res.getByText("Yes"));

    await waitFor(() => {
      expect(ExtensionDiscovery.getInstance().uninstallExtension).toHaveBeenCalled();
      fireEvent.click(menuTrigger);
      expect(res.getByText("Disable")).toHaveAttribute("aria-disabled", "true");
      expect(res.getByText("Uninstall")).toHaveAttribute("aria-disabled", "true");
    }, {
      timeout: 30000,
    });
  });

  it("disables install button while installing", async () => {
    const res = render(<Extensions />);

    (fse.unlink as jest.MockedFunction<typeof fse.unlink>).mockReturnValue(Promise.resolve() as any);

    fireEvent.change(res.getByPlaceholderText("File path or URL", {
      exact: false,
    }), {
      target: {
        value: "https://test.extensionurl/package.tgz",
      },
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

    expect(container.querySelector(".Spinner")).not.toBeInTheDocument();
  });
});
