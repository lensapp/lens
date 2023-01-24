/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

export const defaultDrawerWidth = 725;

const drawerStorageInjectable = getInjectable({
  id: "drawer-storage",

  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage("drawer", {
      width: defaultDrawerWidth,
    });
  },
});

export default drawerStorageInjectable;
