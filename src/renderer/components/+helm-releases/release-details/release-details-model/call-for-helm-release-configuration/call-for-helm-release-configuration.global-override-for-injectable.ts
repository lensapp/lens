/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../../../../common/test-utils/get-global-override";
import callForHelmReleaseConfigurationInjectable from "./call-for-helm-release-configuration.injectable";

export default getGlobalOverride(
  callForHelmReleaseConfigurationInjectable,
  () => () => {
    throw new Error(
      "Tried to call for helm release configuration without explicit override.",
    );
  },
);
