/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { StorageLayer } from "../../../utils";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";
import { DockStorageState, TabKind } from "./store";

let dockStorage: StorageLayer<DockStorageState>;

const dockStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = di.inject(createStorageInjectable);

    dockStorage = await createStorage<DockStorageState>("dock", {
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
  instantiate: () => dockStorage,
  lifecycle: lifecycleEnum.singleton,
});

export default dockStorageInjectable;
