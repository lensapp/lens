/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React from "react";

import { Drawer } from "../../drawer";
import { cssNames } from "../../../utils";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { TargetHelmRelease } from "./target-helm-release.injectable";
import type { ActiveThemeType } from "../../../themes/active-type.injectable";
import activeThemeTypeInjectable from "../../../themes/active-type.injectable";
import { ReleaseDetailsContent } from "./release-details-content";
import navigateToHelmReleasesInjectable from "../../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import { ReleaseDetailsDrawerToolbar } from "./release-details-drawer-toolbar";
import type { ReleaseDetailsModel } from "./release-details-model/release-details-model.injectable";
import releaseDetailsModelInjectable from "./release-details-model/release-details-model.injectable";
import { Spinner } from "../../spinner";

interface ReleaseDetailsDrawerProps {
  targetRelease: TargetHelmRelease;
}

interface Dependencies {
  activeThemeType: ActiveThemeType;
  closeDrawer: () => void;
  model: ReleaseDetailsModel;
}

const NonInjectedReleaseDetailsDrawer = observer(({
  activeThemeType,
  closeDrawer,
  targetRelease,
  model,
}: Dependencies & ReleaseDetailsDrawerProps) => (
  <Drawer
    className={cssNames("ReleaseDetails", activeThemeType.get())}
    usePortal={true}
    open={true}
    title={targetRelease.name}
    onClose={closeDrawer}
    testIdForClose="close-helm-release-detail"
    toolbar={<ReleaseDetailsDrawerToolbar model={model} />}
    data-testid={`helm-release-details-for-${targetRelease.namespace}/${targetRelease.name}`}
  >
    <ReleaseDetailsContent model={model} />
  </Drawer>
));

interface PlaceholderDependencies {
  activeThemeType: ActiveThemeType;
  closeDrawer: () => void;
}

const NonInjectedReleaseDetailsDrawerPlaceholder = observer(({
  targetRelease,
  activeThemeType,
  closeDrawer,
}: ReleaseDetailsDrawerProps & PlaceholderDependencies) => (
  <Drawer
    className={cssNames("ReleaseDetails", activeThemeType.get())}
    usePortal={true}
    open={true}
    title={targetRelease.name}
    onClose={closeDrawer}
    testIdForClose="close-helm-release-detail"
    data-testid={`helm-release-details-for-${targetRelease.namespace}/${targetRelease.name}`}
  >
    <Spinner center data-testid="helm-release-detail-content-spinner" />
  </Drawer>
));

const ReleaseDetailsDrawerPlaceholder = withInjectables<PlaceholderDependencies, ReleaseDetailsDrawerProps>(NonInjectedReleaseDetailsDrawerPlaceholder, {
  getProps: (di, props) => ({
    ...props,
    activeThemeType: di.inject(activeThemeTypeInjectable),
    closeDrawer: di.inject(navigateToHelmReleasesInjectable),
  }),
});

export const ReleaseDetailsDrawer = withInjectables<Dependencies, ReleaseDetailsDrawerProps>(NonInjectedReleaseDetailsDrawer, {
  getPlaceholder: ReleaseDetailsDrawerPlaceholder,
  getProps: async (di, props) => ({
    ...props,
    activeThemeType: di.inject(activeThemeTypeInjectable),
    closeDrawer: di.inject(navigateToHelmReleasesInjectable),
    model: await di.inject(releaseDetailsModelInjectable, props.targetRelease),
  }),
});
