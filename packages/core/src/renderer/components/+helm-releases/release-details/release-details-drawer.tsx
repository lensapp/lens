/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { Drawer } from "../../drawer";
import { cssNames } from "@k8slens/utilities";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TargetHelmRelease } from "./target-helm-release.injectable";
import type { ActiveThemeType } from "../../../themes/active-type.injectable";
import activeThemeTypeInjectable from "../../../themes/active-type.injectable";
import { ReleaseDetailsContent } from "./release-details-content";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import { ReleaseDetailsDrawerToolbar } from "./release-details-drawer-toolbar";

interface ReleaseDetailsDrawerProps {
  targetRelease: TargetHelmRelease;
}

interface Dependencies {
  activeThemeType: ActiveThemeType;
  closeDrawer: () => void;
}

const NonInjectedReleaseDetailsDrawer = observer(({
  activeThemeType,
  closeDrawer,
  targetRelease,
}: Dependencies & ReleaseDetailsDrawerProps) => (
  <Drawer
    className={cssNames("ReleaseDetails", activeThemeType.get())}
    usePortal={true}
    open={true}
    title={targetRelease.name}
    onClose={closeDrawer}
    testIdForClose="close-helm-release-detail"
    toolbar={<ReleaseDetailsDrawerToolbar targetRelease={targetRelease} />}
    data-testid={`helm-release-details-for-${targetRelease.namespace}/${targetRelease.name}`}
  >
    <ReleaseDetailsContent targetRelease={targetRelease} />
  </Drawer>
));

export const ReleaseDetailsDrawer = withInjectables<
  Dependencies,
  ReleaseDetailsDrawerProps
>(NonInjectedReleaseDetailsDrawer, {
  getProps: (di, props) => ({
    activeThemeType: di.inject(activeThemeTypeInjectable),
    closeDrawer: di.inject(navigateToHelmReleasesInjectable),
    ...props,
  }),
});
