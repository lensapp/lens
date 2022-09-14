/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "./directory-for-user-data/directory-for-user-data.injectable";
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import joinPathsInjectable from "../path/join-paths.injectable";

const directoryForBinariesInjectable = createLazyInitializableState({
  id: "directory-for-binaries",
  init: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return joinPaths(directoryForUserData.get(), "binaries");
  },
});

export default directoryForBinariesInjectable;
