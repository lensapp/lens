/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data.injectable";

const directoryForLensLocalStorageInjectable = getInjectable({
  instantiate: (di) =>
    path.resolve(
      di.inject(directoryForUserDataInjectable),
      "lens-local-storage",
    ),

  lifecycle: lifecycleEnum.singleton,
});

export default directoryForLensLocalStorageInjectable;
