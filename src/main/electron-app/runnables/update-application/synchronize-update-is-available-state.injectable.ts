/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../../../../common/utils/get-startable-stoppable";
import electronUpdaterInjectable from "../../features/electron-updater.injectable";
import updateIsAvailableStateInjectable from "../../../update-app/update-is-available-state.injectable";

const synchronizeUpdateIsAvailableStateInjectable = getInjectable({
  id: "synchronize-update-is-available-state",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const updateIsAvailableState = di.inject(updateIsAvailableStateInjectable);

    const makeUpdateAvailableFor = (available: boolean) => () => {
      updateIsAvailableState.set(available);
    };

    return getStartableStoppable(
      "synchronize-update-is-available-state",
      () => {

        const makeUpdateAvailable = makeUpdateAvailableFor(true);
        const makeUpdateUnavailable = makeUpdateAvailableFor(false);

        electronUpdater.on("update-downloaded", makeUpdateAvailable);
        electronUpdater.on("update-not-available", makeUpdateUnavailable);

        return () => {
          electronUpdater.off("update-downloaded", makeUpdateAvailable);
          electronUpdater.off("update-not-available", makeUpdateUnavailable);
        };
      },
    );
  },
});

export default synchronizeUpdateIsAvailableStateInjectable;
