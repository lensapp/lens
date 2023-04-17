/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SemVer } from "semver";
import { buildVersionInitializable } from "../../features/vars/build-version/common/token";
import { createInitializableState } from "../initializable-state/create";

const buildSemanticVersionInjectable = createInitializableState({
  id: "build-semantic-version",
  init: (di) => new SemVer(di.inject(buildVersionInitializable.stateToken)),
});

export default buildSemanticVersionInjectable;

