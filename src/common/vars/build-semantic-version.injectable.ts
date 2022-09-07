/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken, getInjectable } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import type { RequestChannel } from "../utils/channel/request-channel-injection-token";

export const buildVersionInjectionToken = getInjectionToken<string>({
  id: "build-version-token",
});

export const buildVersionChannel: RequestChannel<void, string> = {
  id: "build-version",
};

const buildSemanticVersionInjectable = getInjectable({
  id: "build-semantic-version",
  instantiate: (di) => new SemVer(di.inject(buildVersionInjectionToken)),
});

export default buildSemanticVersionInjectable;

