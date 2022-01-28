/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints";

export interface HelmReleaseScaleDialogState {
  helmRelease: HelmRelease | null;
}

const helmReleaseRollbackDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<HelmReleaseScaleDialogState>({
    helmRelease: null,
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default helmReleaseRollbackDialogStateInjectable;
