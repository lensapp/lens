/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import type { ReleaseDetailsModel } from "./release-details-model/release-details-model.injectable";
import { HelmReleaseMenu } from "../release-menu";

interface ReleaseDetailsDrawerProps {
  model: ReleaseDetailsModel;
}

interface Dependencies {
  navigateToHelmReleases: () => void;
}

const NonInjectedReleaseDetailsDrawerToolbar = observer(({
  model,
  navigateToHelmReleases,
}: Dependencies & ReleaseDetailsDrawerProps) => {
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
    navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
  }),
});
