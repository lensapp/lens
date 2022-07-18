/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRelease } from "../../../k8s/helm-release";
import releaseRollbackDialogStateInjectable from "./state.injectable";

export type OpenHelmReleaseRollbackDialog = (release: HelmRelease) => void;

const openHelmReleaseRollbackDialogInjectable = getInjectable({
  id: "open-helm-release-dialog",
  instantiate: (di): OpenHelmReleaseRollbackDialog => {
    const state = di.inject(releaseRollbackDialogStateInjectable);

    return release => state.set(release);
  },
});

export default openHelmReleaseRollbackDialogInjectable;
