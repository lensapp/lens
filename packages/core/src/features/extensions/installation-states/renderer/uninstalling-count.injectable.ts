/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { iter } from "../../../../common/utils";
import extensionInstallationStatesInjectable from "./states.injectable";

const extensionsUninstallingCountInjectable = getInjectable({
  id: "extensions-uninstalling-count",
  instantiate: (di) => {
    const states = di.inject(extensionInstallationStatesInjectable);

    return computed(() => (
      iter.chain(states.entries())
        .filter(([, state]) => state === "uninstalling")
        .count()
    ));
  },
});

export default extensionsUninstallingCountInjectable;
