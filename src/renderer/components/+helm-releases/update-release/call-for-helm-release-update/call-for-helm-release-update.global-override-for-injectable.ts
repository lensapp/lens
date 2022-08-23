/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../../../common/test-utils/get-global-override";
import callForHelmReleaseUpdateInjectable from "./call-for-helm-release-update.injectable";

export default getGlobalOverride(
  callForHelmReleaseUpdateInjectable,
  () => () => {
    throw new Error(
      "Tried to call for helm release update without explicit override.",
    );
  },
);
