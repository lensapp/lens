/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../../../../../common/test-utils/get-global-override";
import callForHelmReleaseDetailsInjectable from "./call-for-helm-release-details.injectable";

export default getGlobalOverride(
  callForHelmReleaseDetailsInjectable,
  () => () => {
    throw new Error(
      "Tried to call for helm release details without explicit override.",
    );
  },
);
