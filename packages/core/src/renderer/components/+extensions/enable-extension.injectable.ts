/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import getInstalledExtensionInjectable from "../../../features/extensions/common/get-installed-extension.injectable";
import type { LensExtensionId } from "../../../features/extensions/common/installed-extension";

export type EnableExtension = (id: LensExtensionId) => void;

const enableExtensionInjectable = getInjectable({
  id: "enable-extension",

  instantiate: (di): EnableExtension => {
    const getInstalledExtension = di.inject(getInstalledExtensionInjectable);

    return action((id) => {
      const extension = getInstalledExtension(id);

      if (!extension) {
        throw new Error(`Missing extension with id="${id}"`);
      }

      if (extension.isBundled) {
        throw new Error("Cannot change the enabled state for bundled extensions");
      }

      extension.isEnabled = true;
    });
  },
});

export default enableExtensionInjectable;
