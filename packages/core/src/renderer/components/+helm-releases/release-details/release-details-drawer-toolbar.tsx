/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { observer } from "mobx-react";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
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
  computedModel: IAsyncComputed<ReleaseDetailsModel>;
  navigateToHelmReleases: () => void;
}

const NonInjectedReleaseDetailsDrawerToolbar = observer(({
  computedModel,
  navigateToHelmReleases,
}: Dependencies & ReleaseDetailsDrawerProps) => {
  const model = computedModel.value.get();

  if (!model) {
    return null;
  }

  if (model.loadingError.get()) {
    return null;
  }

  return (
    <HelmReleaseMenu
      release={model.release}
      toolbar
      hideDetails={navigateToHelmReleases}
    />
  );
});

export const ReleaseDetailsDrawerToolbar = withInjectables<Dependencies, ReleaseDetailsDrawerProps>(NonInjectedReleaseDetailsDrawerToolbar, {
  getProps: (di, props) => ({
    ...props,
    computedModel: di.inject(releaseDetailsModelInjectable, props.targetRelease),
    navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
  }),
});
