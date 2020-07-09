import "./releases.scss";

import React, { Component } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { releaseStore } from "./release.store";
import { ReleaseRouteParams, releaseURL } from "./release.route";
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

interface Props extends RouteComponentProps<ReleaseRouteParams> {
}

@observer
export class HelmReleases extends Component<Props> {

  componentDidMount(): void {
    // Watch for secrets associated with releases and react to their changes
    releaseStore.watch();
  }

  componentWillUnmount(): void {
    releaseStore.unwatch();
  }

  get selectedRelease(): HelmRelease {
    const { match: { params: { name, namespace } } } = this.props;
    return releaseStore.items.find(release => {
      return release.getName() == name && release.namespace == namespace;
    });
  }

  showDetails = (item: HelmRelease): void => {
    if (!item) {
      navigation.merge(releaseURL());
    } else {
      navigation.merge(releaseURL({
        params: {
          name: item.getName(),
          namespace: item.namespace
        }
      }));
    }
  }

  hideDetails = (): void => {
    this.showDetails(null);
  }

  renderRemoveDialogMessage(selectedItems: HelmRelease[]): JSX.Element {
    const releaseNames = selectedItems.map(item => item.getName()).join(", ");
    return (
      <div>
        <Trans>Remove <b>{releaseNames}</b>?</Trans>
        <p className="warning">
          <Trans>Note: StatefulSet Volumes won&apos;t be deleted automatically</Trans>
        </p>
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <>
        <ItemListLayout
          className="HelmReleases"
          store={releaseStore}
          dependentStores={[secretsStore]}
          sortingCallbacks={{
            [sortBy.name]: (release: HelmRelease): string => release.getName(),
            [sortBy.namespace]: (release: HelmRelease): string => release.namespace,
            [sortBy.revision]: (release: HelmRelease): number => release.revision,
            [sortBy.chart]: (release: HelmRelease): string => release.getChart(),
            [sortBy.status]: (release: HelmRelease): string => release.status,
            [sortBy.updated]: (release: HelmRelease): string | number => release.getUpdated(false, false),
          }}
          searchFilters={[
            (release: HelmRelease): string => release.getName(),
            (release: HelmRelease): string => release.namespace,
            (release: HelmRelease): string => release.getChart(),
            (release: HelmRelease): string => release.getStatus(),
            (release: HelmRelease): string | number => release.getVersion(),
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
          renderTableContents={(release: HelmRelease): (string | number | React.ReactNode)[] => {
            const version = release.getVersion();
            return [
              release.getName(),
              release.namespace,
              release.getChart(),
              release.revision,
              <>
                {version}
              </>,
              release.appVersion,
              { title: release.getStatus(), className: kebabCase(release.getStatus()) },
              release.getUpdated(),
            ];
          }}
          renderItemMenu={(release: HelmRelease): JSX.Element => {
            return (
              <HelmReleaseMenu
                release={release}
                removeConfirmationMessage={this.renderRemoveDialogMessage([release])}
              />
            );
          }}
          customizeRemoveDialog={(selectedItems: HelmRelease[]): {message: JSX.Element} => ({
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