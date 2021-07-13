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
import type { HelmRelease } from "../../api/endpoints/helm-releases.api";
import { boundMethod, cssNames } from "../../utils";
import { releaseStore } from "./release.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { ReleaseRollbackDialog } from "./release-rollback-dialog";
import { createUpgradeChartTab } from "../dock/upgrade-chart.store";

interface Props extends MenuActionsProps {
  release: HelmRelease;
  hideDetails?(): void;
}

export class HelmReleaseMenu extends React.Component<Props> {
  @boundMethod
  remove() {
    return releaseStore.remove(this.props.release);
  }

  @boundMethod
  upgrade() {
    const { release, hideDetails } = this.props;

    createUpgradeChartTab(release);
    hideDetails && hideDetails();
  }

  @boundMethod
  rollback() {
    ReleaseRollbackDialog.open(this.props.release);
  }

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
      >
        {this.renderContent()}
      </MenuActions>
    );
  }
}
