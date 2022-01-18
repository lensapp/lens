/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createStorageInjectable from "../../../utils/create-storage/create-storage.injectable";

export const defaultDrawerWidth = 725;

const drawerStorageInjectable = getInjectable({
  instantiate: (di) => {
    const createStorage = di.inject(createStorageInjectable);

    return createStorage("drawer", {
      width: defaultDrawerWidth,
    });
  },

  lifecycle: lifecycleEnum.singleton,
});

export default drawerStorageInjectable;
