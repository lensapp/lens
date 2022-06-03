/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterIsActiveInjectable from "../electron-app/features/electron-updater-is-active.injectable";
import publishIsConfiguredInjectable from "./publish-is-configured.injectable";

const updatingIsEnabledInjectable = getInjectable({
  id: "updating-is-enabled",

  instantiate: (di) => {
    const electronUpdaterIsActive = di.inject(electronUpdaterIsActiveInjectable);
    const publishIsConfigured = di.inject(publishIsConfiguredInjectable);

    return electronUpdaterIsActive && publishIsConfigured;
  },
});

export default updatingIsEnabledInjectable;
