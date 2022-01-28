/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../../utils";
import type { HelmReleaseScaleDialogState } from "./state.injectable";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";

interface Dependencies {
  helmreleaseScaleDialogState: HelmReleaseScaleDialogState;
}

function closeHelmReleaseScaleDialog({ helmreleaseScaleDialogState }: Dependencies): void {
  helmreleaseScaleDialogState.helmRelease = null;
}

const closeHelmReleaseRollbackDialogInjectable = getInjectable({
  instantiate: (di) => bind(closeHelmReleaseScaleDialog, null, {
    helmreleaseScaleDialogState: di.inject(helmReleaseRollbackDialogStateInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default closeHelmReleaseRollbackDialogInjectable;
