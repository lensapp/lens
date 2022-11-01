/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import { initializeBuildVersionOnMainInjectable } from "../../main/vars/build-version/build-version.injectable";
import { initializeBuildVersionOnRendererInjectable } from "../../renderer/vars/build-version.injectable";
import type { InitializableState } from "../initializable-state/create";
import { createDependentInitializableState } from "../initializable-state/create-dependent";
import type { RequestChannel } from "../utils/channel/request-channel-listener-injection-token";

export const buildVersionInjectionToken = getInjectionToken<InitializableState<string>>({
  id: "build-version-token",
});

export const buildVersionChannel: RequestChannel<void, string> = {
  id: "build-version",
};

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

