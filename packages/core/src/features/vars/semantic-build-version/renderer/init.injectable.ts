/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SemVer } from "semver";
import { getInjectablesForInitializable } from "../../../../common/initializable-state/create";
import { buildVersionInitializable } from "../../build-version/common/token";
import { buildVersionInitializationInjectable } from "../../build-version/renderer/init.injectable";
import { semanticBuildVersionInitializable } from "../common/token";

export const {
  stateInjectable: semanticBuildVersionStateInjectable,
  initializationInjectable: semanticBuildVersionInitializationInjectable,
} = getInjectablesForInitializable({
  init: (di) => new SemVer(di.inject(buildVersionInitializable.stateToken)),
  token: semanticBuildVersionInitializable,
  runAfter: buildVersionInitializationInjectable,
});
