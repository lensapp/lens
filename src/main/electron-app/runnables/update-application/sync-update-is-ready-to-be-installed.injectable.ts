/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../../../../common/utils/get-startable-stoppable";
import electronUpdaterInjectable from "../../features/electron-updater.injectable";
import updateIsReadyToBeInstalledStateInjectable from "../../../update-app/update-is-ready-to-be-installed-state.injectable";

const syncUpdateIsReadyToBeInstalledInjectable = getInjectable({
  id: "sync-update-is-ready-to-be-installed",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const updateIsReadyToBeInstalledState = di.inject(updateIsReadyToBeInstalledStateInjectable);

    const makeUpdateReadyToBeInstalledFor = (available: boolean) => () => {
      updateIsReadyToBeInstalledState.set(available);
    };

    return getStartableStoppable(
      "synchronize-update-is-available-state",
      () => {

        const makeUpdateReadyToBeInstalled = makeUpdateReadyToBeInstalledFor(true);
        const makeUpdateUnavailable = makeUpdateReadyToBeInstalledFor(false);

        electronUpdater.on("update-downloaded", makeUpdateReadyToBeInstalled);
        electronUpdater.on("update-not-available", makeUpdateUnavailable);

        return () => {
          electronUpdater.off("update-downloaded", makeUpdateReadyToBeInstalled);
          electronUpdater.off("update-not-available", makeUpdateUnavailable);
        };
      },
    );
  },
});

export default syncUpdateIsReadyToBeInstalledInjectable;
