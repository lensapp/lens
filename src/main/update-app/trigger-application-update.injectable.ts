/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import quitAndInstallUpdateInjectable from "../electron-app/features/quit-and-install-update.injectable";

const triggerApplicationUpdateInjectable = getInjectable({
  id: "trigger-application-update",

  instantiate: (di) => {
    const quitAndInstallUpdate = di.inject(quitAndInstallUpdateInjectable);

    return () => {
      quitAndInstallUpdate();
    };
  },
});

export default triggerApplicationUpdateInjectable;
