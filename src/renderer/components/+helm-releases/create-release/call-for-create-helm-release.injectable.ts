/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseCreatePayload, HelmReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { createRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";

export type CallForCreateHelmRelease = (
  payload: HelmReleaseCreatePayload
) => Promise<HelmReleaseUpdateDetails>;

const callForCreateHelmReleaseInjectable = getInjectable({
  id: "call-for-create-helm-release",
  instantiate: (): CallForCreateHelmRelease => createRelease,
  causesSideEffects: true,
});

export default callForCreateHelmReleaseInjectable;
