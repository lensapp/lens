/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForUserDataInjectable
  from "../../../common/app-paths/directory-for-user-data.injectable";

const extensionPackageRootDirectoryInjectable = getInjectable({
  instantiate: (di) => di.inject(directoryForUserDataInjectable),

  lifecycle: lifecycleEnum.singleton,
});

export default extensionPackageRootDirectoryInjectable;
