import React from "react";
import { t, Trans } from "@lingui/macro";
import { HelmRelease } from "../../api/endpoints/helm-releases.api";
import { autobind, cssNames } from "../../utils";
import { releaseStore } from "./release.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { MenuItem } from "../menu";
import { Icon } from "../icon";
import { ReleaseRollbackDialog } from "./release-rollback-dialog";
import { createUpgradeChartTab } from "../dock/upgrade-chart.store";
import { _i18n } from "../../i18n";

interface Props extends MenuActionsProps {
  release: HelmRelease;
  hideDetails?(): void;
}

export class HelmReleaseMenu extends React.Component<Props> {
  @autobind()
  remove() {
    return releaseStore.remove(this.props.release);
  }

  @autobind()
  upgrade() {
    const { release, hideDetails } = this.props;
    createUpgradeChartTab(release);
    hideDetails && hideDetails();
  }

  @autobind()
  rollback() {
    ReleaseRollbackDialog.open(this.props.release);
  }

  renderContent() {
    const { release, toolbar } = this.props;
    if (!release) return;
    const hasRollback = release && release.getRevision() > 1;
    return (
      <>
        {hasRollback && (
          <MenuItem onClick={this.rollback}>
            <Icon material="history" interactive={toolbar} title={_i18n._(t`Rollback`)}/>
            <span className="title"><Trans>Rollback</Trans></span>
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
