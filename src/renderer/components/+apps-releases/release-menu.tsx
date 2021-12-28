/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { cssNames } from "../../utils";
import type { ReleaseStore } from "./release.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import releaseStoreInjectable from "./release-store.injectable";
import createUpgradeChartTabInjectable
  from "../dock/create-upgrade-chart-tab/create-upgrade-chart-tab.injectable";
import releaseRollbackDialogModelInjectable
  from "./release-rollback-dialog-model/release-rollback-dialog-model.injectable";

interface Props extends MenuActionsProps {
  release: HelmRelease;
  hideDetails?(): void;
}

interface Dependencies {
  releaseStore: ReleaseStore
  createUpgradeChartTab: (release: HelmRelease) => void
  openRollbackDialog: (release: HelmRelease) => void
}

class NonInjectedHelmReleaseMenu extends React.Component<Props & Dependencies> {
  remove = () => {
    return this.props.releaseStore.remove(this.props.release);
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
            <Icon material="history" interactive={toolbar} tooltip="Rollback"/>
            <span className="title">Rollback</span>
          </MenuItem>
        )}
        <MenuItem onClick={this.upgrade}>
          <Icon material="refresh" interactive={toolbar} tooltip="Upgrade"/>
          <span className="title">Upgrade</span>
        </MenuItem>
      </>
    );
  }

  render() {
    const { className, release, ...menuProps } = this.props;

    return (
      <MenuActions
        {...menuProps}
        className={cssNames("HelmReleaseMenu", className)}
        removeAction={this.remove}
        removeConfirmationMessage={() => <p>Remove Helm Release <b>{release.name}</b>?</p>}
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}

export const HelmReleaseMenu = withInjectables<Dependencies, Props>(
  NonInjectedHelmReleaseMenu,

  {
    getProps: (di, props) => ({
      releaseStore: di.inject(releaseStoreInjectable),
      createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
      openRollbackDialog: di.inject(releaseRollbackDialogModelInjectable).open,

      ...props,
    }),
  },
);
