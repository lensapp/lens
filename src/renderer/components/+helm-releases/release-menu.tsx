/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames } from "../../utils";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { CreateUpgradeChartTab } from "../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import createUpgradeChartTabInjectable from "../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import type { OpenHelmReleaseRollbackDialog } from "./dialog/open.injectable";
import openHelmReleaseRollbackDialogInjectable from "./dialog/open.injectable";
import type { HelmRelease } from "../../k8s/helm-release";
import type { DeleteHelmRelease } from "../../k8s/helm-releases.api/delete.injectable";
import deleteHelmReleaseInjectable from "../../k8s/helm-releases.api/delete.injectable";

export interface HelmReleaseMenuProps extends MenuActionsProps {
  release: HelmRelease;
  hideDetails?(): void;
}

interface Dependencies {
  deleteHelmRelease: DeleteHelmRelease;
  createUpgradeChartTab: CreateUpgradeChartTab;
  openRollbackDialog: OpenHelmReleaseRollbackDialog;
}

class NonInjectedHelmReleaseMenu extends React.Component<HelmReleaseMenuProps & Dependencies> {
  remove = async () => {
    const { name, namespace } = this.props.release;

    await this.props.deleteHelmRelease(name, namespace);
  };

  upgrade = () => {
    const { release, hideDetails } = this.props;

    this.props.createUpgradeChartTab(release);
    hideDetails?.();
  };

  rollback = () => {
    this.props.openRollbackDialog(this.props.release);
  };

  renderContent() {
    const { release, toolbar } = this.props;

    if (!release) return null;
    const hasRollback = release && release.getRevision() > 1;

    return (
      <>
        {hasRollback && (
          <MenuItem onClick={this.rollback}>
            <Icon
              material="history"
              interactive={toolbar}
              tooltip="Rollback"
            />
            <span className="title">Rollback</span>
          </MenuItem>
        )}
        <MenuItem onClick={this.upgrade}>
          <Icon
            material="refresh"
            interactive={toolbar}
            tooltip="Upgrade"
          />
          <span className="title">Upgrade</span>
        </MenuItem>
      </>
    );
  }

  render() {
    const { className, release, ...menuProps } = this.props;

    return (
      <MenuActions
        id={`menu-actions-for-release-menu-for-${release.getId()}`}
        {...menuProps}
        className={cssNames("HelmReleaseMenu", className)}
        removeAction={this.remove}
        removeConfirmationMessage={() => (
          <p>
            Remove Helm Release
            {" "}
            <b>{release.name}</b>
            ?
          </p>
        )}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}

export const HelmReleaseMenu = withInjectables<Dependencies, HelmReleaseMenuProps>(NonInjectedHelmReleaseMenu, {
  getProps: (di, props) => ({
    ...props,
    deleteHelmRelease: di.inject(deleteHelmReleaseInjectable),
    createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
    openRollbackDialog: di.inject(openHelmReleaseRollbackDialogInjectable),
  }),
});
