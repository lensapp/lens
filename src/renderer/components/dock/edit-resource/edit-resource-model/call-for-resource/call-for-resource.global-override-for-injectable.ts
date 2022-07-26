/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../../../../../../common/test-utils/get-global-override";
import callForResourceInjectable from "./call-for-resource.injectable";

export default getGlobalOverride(callForResourceInjectable, () => () => {
  throw new Error(
    "Tried to call for kube resource without explicit override.",
  );
});
