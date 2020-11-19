import "./releases.scss";

import React, { Component } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { releaseStore } from "./release.store";
import { IReleaseRouteParams, releaseURL } from "./release.route";
import { HelmRelease } from "../../api/endpoints/helm-releases.api";
import { ReleaseDetails } from "./release-details";
import { ReleaseRollbackDialog } from "./release-rollback-dialog";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { HelmReleaseMenu } from "./release-menu";
import { secretsStore } from "../+config-secrets/secrets.store";

enum sortBy {
  name = "name",
  namespace = "namespace",
  revision = "revision",
  chart = "chart",
  status = "status",
  updated = "update"
}

interface Props extends RouteComponentProps<IReleaseRouteParams> {
}

@observer
export class HelmReleases extends Component<Props> {

  componentDidMount() {
    // Watch for secrets associated with releases and react to their changes
    releaseStore.watch();
  }

  componentWillUnmount() {
    releaseStore.unwatch();
  }

  get selectedRelease() {
    const { match: { params: { name, namespace } } } = this.props;
    return releaseStore.items.find(release => {
      return release.getName() == name && release.getNs() == namespace;
    });
  }

  showDetails = (item: HelmRelease) => {
    if (!item) {
      navigation.merge(releaseURL());
    }
    else {
      navigation.merge(releaseURL({
        params: {
          name: item.getName(),
          namespace: item.getNs()
        }
      }));
    }
  };

  hideDetails = () => {
    this.showDetails(null);
  };

  renderRemoveDialogMessage(selectedItems: HelmRelease[]) {
    const releaseNames = selectedItems.map(item => item.getName()).join(", ");
    return (
      <div>
        <Trans>Remove <b>{releaseNames}</b>?</Trans>
        <p className="warning">
          <Trans>Note: StatefulSet Volumes won't be deleted automatically</Trans>
        </p>
      </div>
    );
  }

  render() {
    return (
      <>
        <ItemListLayout
          className="HelmReleases"
          store={releaseStore}
          dependentStores={[secretsStore]}
          sortingCallbacks={{
            [sortBy.name]: (release: HelmRelease) => release.getName(),
            [sortBy.namespace]: (release: HelmRelease) => release.getNs(),
            [sortBy.revision]: (release: HelmRelease) => release.getRevision(),
            [sortBy.chart]: (release: HelmRelease) => release.getChart(),
            [sortBy.status]: (release: HelmRelease) => release.getStatus(),
            [sortBy.updated]: (release: HelmRelease) => release.getUpdated(false, false),
          }}
          searchFilters={[
            (release: HelmRelease) => release.getName(),
            (release: HelmRelease) => release.getNs(),
            (release: HelmRelease) => release.getChart(),
            (release: HelmRelease) => release.getStatus(),
            (release: HelmRelease) => release.getVersion(),
          ]}
          renderHeaderTitle={<Trans>Releases</Trans>}
          renderTableHeader={[
            { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
            { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
            { title: <Trans>Chart</Trans>, className: "chart", sortBy: sortBy.chart },
            { title: <Trans>Revision</Trans>, className: "revision", sortBy: sortBy.revision },
            { title: <Trans>Version</Trans>, className: "version" },
            { title: <Trans>App Version</Trans>, className: "app-version" },
            { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
            { title: <Trans>Updated</Trans>, className: "updated", sortBy: sortBy.updated },
          ]}
          renderTableContents={(release: HelmRelease) => {
            const version = release.getVersion();
            return [
              release.getName(),
              release.getNs(),
              release.getChart(),
              release.getRevision(),
              <>
                {version}
              </>,
              release.appVersion,
              { title: release.getStatus(), className: kebabCase(release.getStatus()) },
              release.getUpdated(),
            ];
          }}
          renderItemMenu={(release: HelmRelease) => {
            return (
              <HelmReleaseMenu
                release={release}
                removeConfirmationMessage={this.renderRemoveDialogMessage([release])}
              />
            );
          }}
          customizeRemoveDialog={(selectedItems: HelmRelease[]) => ({
            message: this.renderRemoveDialogMessage(selectedItems)
          })}
          detailsItem={this.selectedRelease}
          onDetails={this.showDetails}
        />
        <ReleaseDetails
          release={this.selectedRelease}
          hideDetails={this.hideDetails}
        />
        <ReleaseRollbackDialog/>
      </>
    );
  }
}