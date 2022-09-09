/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../common/test-utils/get-global-override";
import updateHelmReleaseInjectable from "./update-helm-release.injectable";

export default getGlobalOverride(updateHelmReleaseInjectable, () => () => {
  throw new Error("Tried to update helm release without explicit override");
});
