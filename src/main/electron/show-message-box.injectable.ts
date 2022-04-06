/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { BrowserWindow, dialog, MessageBoxOptions, MessageBoxReturnValue } from "electron";

export type ShowMessageBox = (browserWindow: BrowserWindow, options: MessageBoxOptions) => Promise<MessageBoxReturnValue>;

const showMessageBoxInjectable = getInjectable({
  id: "show-message-box",
  instantiate: (): ShowMessageBox => (bw, opts) => dialog.showMessageBox(bw, opts),
  causesSideEffects: true,
});

export default showMessageBoxInjectable;
