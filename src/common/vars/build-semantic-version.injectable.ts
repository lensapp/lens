/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import type { InitializableState } from "../initializable-state/create";
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

export const buildVersionInjectionToken = getInjectionToken<InitializableState<string>>({
  id: "build-version-token",
});

export const buildVersionChannel: RequestChannel<void, string> = {
  id: "build-version",
};

const buildSemanticVersionInjectable = createLazyInitializableState({
  id: "build-semantic-version",
  init: (di) => {
    const buildVersion = di.inject(buildVersionInjectionToken);

    return new SemVer(buildVersion.get());
  },
});

export default buildSemanticVersionInjectable;

