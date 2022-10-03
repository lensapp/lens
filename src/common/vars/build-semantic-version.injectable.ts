/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import type { InitializableState } from "../initializable-state/create";
import { createInitializableState } from "../initializable-state/create";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";

export const buildVersionInjectionToken = getInjectionToken<InitializableState<string>>({
  id: "build-version-token",
});

export const buildVersionChannel: RequestChannel<void, string> = {
  id: "build-version",
};

const buildSemanticVersionInjectable = createInitializableState({
  id: "build-semantic-version",
  init: (di) => {
    const buildVersion = di.inject(buildVersionInjectionToken);

    return new SemVer(buildVersion.get());
  },
});

export default buildSemanticVersionInjectable;

