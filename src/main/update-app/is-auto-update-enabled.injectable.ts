/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterInjectable from "../electron-app/features/electron-updater.injectable";
import packageJsonInjectable from "../../common/vars/package-json.injectable";

const isAutoUpdateEnabledInjectable = getInjectable({
  id: "is-auto-update-enabled",

  instantiate: (di) => {
    const electronUpdater = di.inject(electronUpdaterInjectable);
    const packageJson = di.inject(packageJsonInjectable);

    const isPublishConfigured = Object.keys(packageJson.build).includes("publish");

    return () => {
      return electronUpdater.isUpdaterActive() && isPublishConfigured;
    };
  },
});

export default isAutoUpdateEnabledInjectable;
