/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { AutoUpdateQuitAndInstalledChannel } from "../../../common/ipc";
import broadcastMessageInjectable from "../../../common/ipc/broadcast-message.injectable";

const updateAppInjectable = getInjectable({
  id: "update-app",

  instantiate: (di) => {
    const broadcast = di.inject(broadcastMessageInjectable);

    return () => broadcast(AutoUpdateQuitAndInstalledChannel);
  },
});

export default updateAppInjectable;