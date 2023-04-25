/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronQuitAndInstallUpdateInjectable from "../../../main/electron-app/features/electron-quit-and-install-update.injectable";
import { getCurrentDateTime } from "../../../common/utils/date/get-current-date-time";
import emitAppEventInjectable from "../../../common/app-event-bus/emit-event.injectable";
import discoveredUpdateVersionInjectable from "../common/discovered-update-version.injectable";

const quitAndInstallUpdateInjectable = getInjectable({
  id: "quit-and-install-update",

  instantiate: (di) => {
    const electronQuitAndInstallUpdate = di.inject(
      electronQuitAndInstallUpdateInjectable,
    );

    const emitEvent = di.inject(emitAppEventInjectable);
    const discoveredUpdateVersion = di.inject(discoveredUpdateVersionInjectable);

    return () => {
      const discoveredVersion = discoveredUpdateVersion.value.get();

      if (!discoveredVersion) {
        throw new Error("Tried to install update but no update was discovered.");
      }

      emitEvent({
        name: "app",
        action: "start-installing-update",

        params: {
          version: discoveredVersion.version,
          updateChannel: discoveredVersion.updateChannel.id,
          currentDateTime: getCurrentDateTime(),
        },
      });

      electronQuitAndInstallUpdate();
    };
  },
});

export default quitAndInstallUpdateInjectable;
