/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJsonInjectable from "../../common/vars/package-json.injectable";
import { has } from "lodash/fp";

// TOOO: Rename to something less technical
const publishIsConfiguredInjectable = getInjectable({
  id: "publish-is-configured",

  instantiate: (di) => {
    const packageJson = di.inject(packageJsonInjectable);

    return has("build.publish", packageJson);
  },
});

export default publishIsConfiguredInjectable;
