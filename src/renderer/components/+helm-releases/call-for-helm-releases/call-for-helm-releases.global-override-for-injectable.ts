/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import callForHelmReleasesInjectable from "./call-for-helm-releases.injectable";
import { getGlobalOverride } from "../../../../common/test-utils/get-global-override";

export default getGlobalOverride(
  callForHelmReleasesInjectable,
  () => () => {
    throw new Error(
      "Tried to call for helm releases without explicit override.",
    );
  },
);
