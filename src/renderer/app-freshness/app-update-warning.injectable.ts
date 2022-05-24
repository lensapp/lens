/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AppUpdateWarning } from "./app-update-warning";

const appUpdateWarningInjectable = getInjectable({
  id: "app-update-warning",

  instantiate: () => {
    AppUpdateWarning.resetInstance();

    return AppUpdateWarning.createInstance({
      releaseDate: "Wed, 04 May 2022 02:35:00 +0300",
    });
  },

  causesSideEffects: true,
});

export default appUpdateWarningInjectable;
