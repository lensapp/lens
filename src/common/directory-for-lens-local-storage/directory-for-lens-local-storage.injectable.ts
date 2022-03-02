/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";

const directoryForLensLocalStorageInjectable = getInjectable({
  id: "directory-for-lens-local-storage",

  instantiate: (di) =>
    path.resolve(
      di.inject(directoryForUserDataInjectable),
      "lens-local-storage",
    ),
});

export default directoryForLensLocalStorageInjectable;
