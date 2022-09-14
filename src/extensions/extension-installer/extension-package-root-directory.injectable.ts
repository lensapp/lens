/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import directoryForUserDataInjectable from "../../common/app-paths/directory-for-user-data.injectable";
import { createLazyInitializableState } from "../../common/initializable-state/create-lazy";

const extensionPackageRootDirectoryInjectable = createLazyInitializableState({
  id: "extension-package-root-directory",
  init: (di) => di.inject(directoryForUserDataInjectable).get(),
});

export default extensionPackageRootDirectoryInjectable;
