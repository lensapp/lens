/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

const extensionPackageRootDirectoryInjectable = getInjectable({
  id: "extension-package-root-directory",

  instantiate: (di) => di.inject(directoryForUserDataInjectable),
});

export default extensionPackageRootDirectoryInjectable;
