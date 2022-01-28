/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-release.api";
import { cssNames, noop } from "../../utils";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import newUpgradeChartTabInjectable from "../dock/upgrade-chart/create-tab.injectable";
import { observer } from "mobx-react";
import openHelmReleaseRollbackDialogInjectable from "./rollback-dialog/open.injectable";
import deleteReleaseInjectable from "./delete-release.injectable";

export interface HelmReleaseMenuProps extends MenuActionsProps {
  release: HelmRelease | null | undefined;
  hideDetails?: () => void;
}

interface Dependencies {
  newUpgradeChartTab: (release: HelmRelease) => void;
  deleteRelease: (release: HelmRelease) => Promise<any>;
  openRollbackReleaseDialog: (release: HelmRelease) => void;
}

const NonInjectedHelmReleaseMenu = observer(({
  newUpgradeChartTab,
  release,
  hideDetails = noop,
  deleteRelease,
  openRollbackReleaseDialog,
  toolbar,
  className,
  ...menuProps
}: Dependencies & HelmReleaseMenuProps) => {
  if (!release) {
    return null;
  }

  const remove = () => deleteRelease(release);
  const upgrade = () => {
    newUpgradeChartTab(release);
    hideDetails();
  };
  const rollback = () => openRollbackReleaseDialog(release);

  return (
    <MenuActions
      {...menuProps}
      className={cssNames("HelmReleaseMenu", className)}
      removeAction={remove}
      removeConfirmationMessage={() => <p>Remove Helm Release <b>{release.name}</b>?</p>}
    >
      {release.getRevision() > 1 && (
        <MenuItem onClick={rollback}>
          <Icon material="history" interactive={toolbar} tooltip="Rollback"/>
          <span className="title">Rollback</span>
        </MenuItem>
      )}
      <MenuItem onClick={upgrade}>
        <Icon material="refresh" interactive={toolbar} tooltip="Upgrade"/>
        <span className="title">Upgrade</span>
      </MenuItem>
    </MenuActions>
  );
});

export const HelmReleaseMenu = withInjectables<Dependencies, HelmReleaseMenuProps>(NonInjectedHelmReleaseMenu, {
  getProps: (di, props) => ({
    newUpgradeChartTab: di.inject(newUpgradeChartTabInjectable),
    deleteRelease: di.inject(deleteReleaseInjectable),
    openRollbackReleaseDialog: di.inject(openHelmReleaseRollbackDialogInjectable),
    ...props,
  }),
});
