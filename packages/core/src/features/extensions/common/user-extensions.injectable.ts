/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ExternalInstalledExtension, LensExtensionId } from "./installed-extension";
import installedExtensionsInjectable from "./installed-extensions.injectable";

const installedUserExtensionsInjectable = getInjectable({
  id: "installed-user-extensions",
  instantiate: (di) => {
    const installedExtensions = di.inject(installedExtensionsInjectable);

    return computed(() => new Map((
      installedExtensions.toJSON()
        .filter((entry): entry is [LensExtensionId, ExternalInstalledExtension] => !entry[1].isBundled)
    )));
  },
});

export default installedUserExtensionsInjectable;
