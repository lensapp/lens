/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TargetHelmRelease } from "./target-helm-release.injectable";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import type { ReleaseDetailsModel } from "./release-details-model/release-details-model.injectable";
import releaseDetailsModelInjectable from "./release-details-model/release-details-model.injectable";
import { HelmReleaseMenu } from "../release-menu";

interface ReleaseDetailsDrawerProps {
  targetRelease: TargetHelmRelease;
}

interface Dependencies {
  model: ReleaseDetailsModel;
  navigateToHelmReleases: () => void;
}

const NonInjectedReleaseDetailsDrawerToolbar = observer(({
  model,
  navigateToHelmReleases,
}: Dependencies & ReleaseDetailsDrawerProps) => (
  model.loadingError.get()
    ? null
    : (
      <HelmReleaseMenu
        release={model.release}
        toolbar
        hideDetails={navigateToHelmReleases}
      />
    )
));

export const ReleaseDetailsDrawerToolbar = withInjectables<
  Dependencies,
  ReleaseDetailsDrawerProps
>(NonInjectedReleaseDetailsDrawerToolbar, {
  getPlaceholder: () => <></>,

  getProps: async (di, props) => ({
    model: await di.inject(releaseDetailsModelInjectable, props.targetRelease),
    navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
    ...props,
  }),
});
