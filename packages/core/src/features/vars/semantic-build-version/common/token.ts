/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SemVer } from "semver";
import { getInitializable } from "../../../../common/initializable-state/create";

export const semanticBuildVersionInitializable = getInitializable<SemVer>("semantic-build-version");
