/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { updateRelease } from "../../../common/k8s-api/endpoints/helm-release.api";

const updateReleaseInjectable = getInjectable({
  instantiate: () => updateRelease,
  lifecycle: lifecycleEnum.singleton,
});

export default updateReleaseInjectable;
