/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SemVer } from "semver";
import { initializeBuildVersionOnMainInjectable } from "../../../main/vars/build-version/build-version.injectable";
import { initializeBuildVersionOnRendererInjectable } from "../../../renderer/vars/build-version.injectable";
import { createDependentInitializableState } from "../../initializable-state/create";
import { buildVersionInjectionToken } from "./token";

const {
  value: buildSemanticVersionInjectable,
  initializers: [
    initBuildSemanticVersionOnMainInjectable,
    initBuildSemanticVersionOnRendererInjectable,
  ],
} = createDependentInitializableState({
  id: "build-semantic-version",
  init: (di) => {
    const buildVersion = di.inject(buildVersionInjectionToken);

    return new SemVer(buildVersion.get());
  },
  initAfter: [
    initializeBuildVersionOnMainInjectable,
    initializeBuildVersionOnRendererInjectable,
  ],
});

export {
  initBuildSemanticVersionOnMainInjectable,
  initBuildSemanticVersionOnRendererInjectable,
};

export default buildSemanticVersionInjectable;

