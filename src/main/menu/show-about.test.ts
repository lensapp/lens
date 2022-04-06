/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { waitFor } from "@testing-library/react";
import appVersionInjectable from "../../common/vars/app-version.injectable";
import chromeVersionInjectable from "../../common/vars/chrome-version.injectable";
import copyrightDeclarationInjectable from "../../common/vars/copyright-declaration.injectable";
import electronVersionInjectable from "../../common/vars/electron-version.injectable";
import nodeVersionInjectable from "../../common/vars/node-version.injectable";
import type { ShowMessageBox } from "../electron/show-message-box.injectable";
import showMessageBoxInjectable from "../electron/show-message-box.injectable";
import type { WriteTextToClipboard } from "../electron/write-text-to-clipboard.injectable";
import writeTextToClipboardInjectable from "../electron/write-text-to-clipboard.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import appNameInjectable from "../vars/app-name.injectable";
import type { ShowAbout } from "./show-about.injectable";
import showAboutInjectable from "./show-about.injectable";

describe("showAbout tests", () => {
  let showAbout: ShowAbout;
  let showMessageBox: jest.MockedFunction<ShowMessageBox>;
  let writeTextToClipboard: jest.MockedFunction<WriteTextToClipboard>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    showMessageBox = jest.fn();
    writeTextToClipboard = jest.fn();

    di.override(showMessageBoxInjectable, () => showMessageBox);
    di.override(writeTextToClipboardInjectable, () => writeTextToClipboard);
    di.override(appNameInjectable, () => "lens");
    di.override(appVersionInjectable, () => "some-app-version");
    di.override(copyrightDeclarationInjectable, () => "some copyright declaration");
    di.override(electronVersionInjectable, () => "some-electron-version");
    di.override(chromeVersionInjectable, () => "some-chrome-version");
    di.override(nodeVersionInjectable, () => "some-node-version");

    showAbout = di.inject(showAboutInjectable);
  });

  it("should write the contents to the clipboard when the copy button is clicked", async () => {
    showMessageBox.mockImplementationOnce(() => Promise.resolve({ response: 0, checkboxChecked: false }));
    showAbout(null);
    await waitFor(() => expect(writeTextToClipboard).toBeCalledWith([
      "lens: some-app-version",
      "Electron: some-electron-version",
      "Chrome: some-chrome-version",
      "Node: some-node-version",
      "some copyright declaration",
    ].join("\n")));
  });
});
