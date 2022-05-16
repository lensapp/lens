/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../item-object-list/item-list-layout.scss";
import "./releases.scss";

import React, { Component } from "react";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/store.injectable";
import type { ItemListStore } from "../item-object-list";
import { ItemListLayout } from "../item-object-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { kebabCase } from "lodash/fp";
import { HelmReleaseMenu } from "./release-menu";
import { ReleaseRollbackDialog } from "./dialog/dialog";
import { ReleaseDetails } from "./release-details/release-details";
import removableReleasesInjectable from "./removable-releases.injectable";
import type { RemovableHelmRelease } from "./removable-releases";
import type { IComputedValue } from "mobx";
import releasesInjectable from "./releases.injectable";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import helmReleasesRouteParametersInjectable from "./helm-releases-route-parameters.injectable";
import type { NavigateToHelmReleases } from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";
import navigateToHelmReleasesInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";

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

interface Dependencies {
  releases: IComputedValue<RemovableHelmRelease[]>;
  releasesArePending: IComputedValue<boolean>;
  selectNamespace: (namespace: string) => void;
  namespace: IComputedValue<string>;
  navigateToHelmReleases: NavigateToHelmReleases;
}

class NonInjectedHelmReleases extends Component<Dependencies> {
  // TODO: This side-effect in mount must go.
  componentDidMount() {
    const namespace = this.props.namespace.get();

    if (namespace) {
      this.props.selectNamespace(namespace);
    }
  }

  onDetails = (item: HelmRelease) => {
    this.showDetails(item);
  };

  showDetails = (item: HelmRelease) => {
    this.props.navigateToHelmReleases({
      name: item.getName(),
      namespace: item.getNs(),
    });
  };

  hideDetails = () => {
    this.props.navigateToHelmReleases();
  };

  renderRemoveDialogMessage(selectedItems: HelmRelease[]) {
    const releaseNames = selectedItems.map(item => item.getName()).join(", ");

    return (
      <div>
        <>
          Remove
          <b>{releaseNames}</b>
          ?
        </>
        <p className="warning">
          Note: StatefulSet Volumes won&apos;t be deleted automatically
        </p>
      </div>
    );
  }

  render() {
    const releases = this.props.releases;
    const releasesArePending = this.props.releasesArePending;

    // TODO: Implement ItemListLayout without stateful stores
    const legacyReleaseStore: ItemListStore<RemovableHelmRelease, false> = {
      get isLoaded() {
        return !releasesArePending.get();
      },

      failedLoading: false,

      getTotalCount: () => releases.get().length,

      toggleSelection: (release) => release.toggle(),

      isSelectedAll: (releases) => (
        releases.length > 0
        && releases.every((release) => release.isSelected)
      ),

      toggleSelectionAll: (releases) => {
        let selected = false;

        if (!legacyReleaseStore.isSelectedAll(releases)) {
          selected = true;
        }

        for (const release of releases) {
          if (release.isSelected !== selected) {
            release.toggle();
          }
        }
      },

      isSelected: (release) => release.isSelected,

      removeSelectedItems: async () => {
        await Promise.all(
          releases.get()
            .filter((release) => release.isSelected)
            .map(release => release.delete()),
        );
      },

      pickOnlySelected: (releases) => releases.filter(release => release.isSelected),
    };

    return (
      <SiblingsInTabLayout>
        <ItemListLayout<RemovableHelmRelease, false>
          store={legacyReleaseStore}
          getItems={() => releases.get()}
          preloadStores={false}
          isConfigurable
          tableId="helm_releases"
          className="HelmReleases"
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
                <NamespaceSelectFilter id="namespace-select-filter" />
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
          onDetails={this.onDetails}
        />

        <ReleaseDetails
          hideDetails={this.hideDetails}
        />

        <ReleaseRollbackDialog/>
      </SiblingsInTabLayout>
    );
  }
}

export const HelmReleases = withInjectables<Dependencies>(
  NonInjectedHelmReleases,

  {
    getProps: (di) => {
      const routeParameters = di.inject(helmReleasesRouteParametersInjectable);

      return {
        releases: di.inject(removableReleasesInjectable),
        releasesArePending: di.inject(releasesInjectable).pending,
        selectNamespace: di.inject(namespaceStoreInjectable).selectNamespaces,
        navigateToHelmReleases: di.inject(navigateToHelmReleasesInjectable),
        namespace: routeParameters.namespace,
      };
    },
  },
);
