/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import getHelmReleaseInjectable from "./get-helm-release.injectable";

export default getGlobalOverride(getHelmReleaseInjectable, () => () => {
  throw new Error("Tried to get helm release without explicit override");
});
