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

import "./releases.scss";

import React, { Component } from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { releaseStore } from "./release.store";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { ReleaseDetails } from "./release-details";
import { ReleaseRollbackDialog } from "./release-rollback-dialog";
import { navigation } from "../../navigation";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { HelmReleaseMenu } from "./release-menu";
import { secretsStore } from "../+config-secrets/secrets.store";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import type { ReleaseRouteParams } from "../../../common/routes";
import { releaseURL } from "../../../common/routes";
import { namespaceStore } from "../+namespaces/namespace.store";

enum columnId {
  name = "name",
  namespace = "namespace",
  revision = "revision",
  chart = "chart",
  version = "version",
  appVersion = "app-version",
  status = "status",
  updated = "update",
}

interface Props extends RouteComponentProps<ReleaseRouteParams> {
}

@observer
export class HelmReleases extends Component<Props> {
  componentDidMount() {
    const { match: { params: { namespace }}} = this.props;

    if (namespace) {
      namespaceStore.selectNamespaces(namespace);
    }

    disposeOnUnmount(this, [
      releaseStore.watchAssociatedSecrets(),
      releaseStore.watchSelectedNamespaces(),
    ]);
  }

  get selectedRelease() {
    const { match: { params: { name, namespace }}} = this.props;

    return releaseStore.items.find(release => {
      return release.getName() == name && release.getNs() == namespace;
    });
  }

  onDetails = (item: HelmRelease) => {
    if (item === this.selectedRelease) {
      this.hideDetails();
    } else {
      this.showDetails(item);
    }
  };

  showDetails = (item: HelmRelease) => {
    navigation.push(releaseURL({
      params: {
        name: item.getName(),
        namespace: item.getNs(),
      },
    }));
  };

  hideDetails = () => {
    navigation.push(releaseURL());
  };

  renderRemoveDialogMessage(selectedItems: HelmRelease[]) {
    const releaseNames = selectedItems.map(item => item.getName()).join(", ");

    return (
      <div>
        <>Remove <b>{releaseNames}</b>?</>
        <p className="warning">
          Note: StatefulSet Volumes won&apos;t be deleted automatically
        </p>
      </div>
    );
  }

  render() {
    return (
      <>
        <ItemListLayout
          isConfigurable
          tableId="helm_releases"
          className="HelmReleases"
          store={releaseStore}
          dependentStores={[secretsStore]}
          sortingCallbacks={{
            [columnId.name]: release => release.getName(),
            [columnId.namespace]: release => release.getNs(),
            [columnId.revision]: release => release.getRevision(),
            [columnId.chart]: release => release.getChart(),
            [columnId.status]: release => release.getStatus(),
            [columnId.updated]: release => release.getUpdated(false, false),
          }}
          searchFilters={[
            release => release.getName(),
            release => release.getNs(),
            release => release.getChart(),
            release => release.getStatus(),
            release => release.getVersion(),
          ]}
          customizeHeader={({ filters, searchProps, ...headerPlaceholders }) => ({
            filters: (
              <>
                {filters}
                <NamespaceSelectFilter />
              </>
            ),
            searchProps: {
              ...searchProps,
              placeholder: "Search Releases...",
            },
            ...headerPlaceholders,
          })}
          renderHeaderTitle="Releases"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
            { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
            { title: "Chart", className: "chart", sortBy: columnId.chart, id: columnId.chart },
            { title: "Revision", className: "revision", sortBy: columnId.revision, id: columnId.revision },
            { title: "Version", className: "version", id: columnId.version },
            { title: "App Version", className: "app-version", id: columnId.appVersion },
            { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
            { title: "Updated", className: "updated", sortBy: columnId.updated, id: columnId.updated },
          ]}
          renderTableContents={release => [
            release.getName(),
            release.getNs(),
            release.getChart(),
            release.getRevision(),
            release.getVersion(),
            release.appVersion,
            { title: release.getStatus(), className: kebabCase(release.getStatus()) },
            release.getUpdated(),
          ]}
          renderItemMenu={release => (
            <HelmReleaseMenu
              release={release}
              removeConfirmationMessage={this.renderRemoveDialogMessage([release])}
            />
          )}
          customizeRemoveDialog={selectedItems => ({
            message: this.renderRemoveDialogMessage(selectedItems),
          })}
          detailsItem={this.selectedRelease}
          onDetails={this.onDetails}
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
