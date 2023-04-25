/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronUpdaterIsActiveInjectable from "../../../../../main/electron-app/features/electron-updater-is-active.injectable";
import { updatingIsEnabledInitializable } from "../common/token";
import publishIsConfiguredInjectable from "./publish-is-configured.injectable";

const updatingIsEnabledInjectable = getInjectable({
  id: "updating-is-enabled",

  instantiate: (di) => {
    const electronUpdaterIsActive = di.inject(electronUpdaterIsActiveInjectable);
    const publishIsConfigured = di.inject(publishIsConfiguredInjectable);

    return electronUpdaterIsActive && publishIsConfigured;
  },
  injectionToken: updatingIsEnabledInitializable.stateToken,
});

export default updatingIsEnabledInjectable;
