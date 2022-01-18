/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../../utils/create-storage/create-storage.injectable";
import { DockStorageState, TabKind } from "../dock.store";

const dockStorageInjectable = getInjectable({
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage<DockStorageState>("dock", {
      height: 300,
      tabs: [
        {
          id: "terminal",
          kind: TabKind.TERMINAL,
          title: "Terminal",
          pinned: false,
        },
      ],
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default dockStorageInjectable;
