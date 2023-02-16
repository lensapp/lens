/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { InstalledExtension } from "../../../extensions/common-api";
import type { LensExtensionId } from "../../../extensions/lens-extension";
import installedExtensionsInjectable from "./installed-extensions.injectable";

export type GetInstalledExtension = (id: LensExtensionId) => InstalledExtension | undefined;

const getInstalledExtensionInjectable = getInjectable({
  id: "get-installed-extension",
  instantiate: (di): GetInstalledExtension => {
    const installedExtensions = di.inject(installedExtensionsInjectable);

    return (id) => installedExtensions.get(id);
  },
});

export default getInstalledExtensionInjectable;
