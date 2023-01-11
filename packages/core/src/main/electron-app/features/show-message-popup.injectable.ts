/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronDialogInjectable from "./electron-dialog.injectable";

export type ShowMessagePopup = (title: string, message: string, detail: string) => void;

const showMessagePopupInjectable = getInjectable({
  id: "show-message-popup",

  instantiate: (di): ShowMessagePopup => {
    const dialog = di.inject(electronDialogInjectable);

    return async (title, message, detail) => {
      await dialog.showMessageBox({
        title,
        message,
        detail,
        type: "info",
        buttons: ["Close"],
      });
    };
  },
});

export default showMessagePopupInjectable;
