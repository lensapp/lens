/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints";
import { bind } from "../../../utils";
import type { HelmReleaseScaleDialogState } from "./state.injectable";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";

interface Dependencies {
  helmreleaseScaleDialogState: HelmReleaseScaleDialogState;
}

function openHelmReleaseScaleDialog({ helmreleaseScaleDialogState }: Dependencies, helmrelease: HelmRelease): void {
  helmreleaseScaleDialogState.helmRelease = helmrelease;
}

const openHelmReleaseRollbackDialogInjectable = getInjectable({
  instantiate: (di) => bind(openHelmReleaseScaleDialog, null, {
    helmreleaseScaleDialogState: di.inject(helmReleaseRollbackDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default openHelmReleaseRollbackDialogInjectable;
