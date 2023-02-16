/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import installedUserExtensionsInjectable from "../../../../features/extensions/common/user-extensions.injectable";

const userExtensionsInjectable = getInjectable({
  id: "user-extensions",

  instantiate: (di) => {
    const installedUserExtensions = di.inject(installedUserExtensionsInjectable);

    return computed(() => [...installedUserExtensions.get().values()]);
  },
});

export default userExtensionsInjectable;
