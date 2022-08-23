/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { showAbout } from "./menu";
import showMessagePopupInjectable from "../electron-app/features/show-message-popup.injectable";
import appVersionInjectable from "../../common/vars/app-version.injectable";
import buildVersionInjectable from "./build-version.injectable";

const showAboutInjectable = getInjectable({
  id: "show-about",

  instantiate: (di) =>
    showAbout({ 
      appVersion: di.inject(buildVersionInjectable),
      extensionApiVersion: di.inject(appVersionInjectable),
      showMessagePopup: di.inject(showMessagePopupInjectable),
    }),
});

export default showAboutInjectable;
