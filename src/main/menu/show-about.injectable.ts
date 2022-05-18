/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { showAbout } from "./menu";
import showMessagePopupInjectable from "../electron-app/features/show-message-popup.injectable";

const showAboutInjectable = getInjectable({
  id: "show-about",

  instantiate: (di) =>
    showAbout({ showMessagePopup: di.inject(showMessagePopupInjectable) }),
});

export default showAboutInjectable;
