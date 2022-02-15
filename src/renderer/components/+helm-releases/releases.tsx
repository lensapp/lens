/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../item-object-list/item-list-layout.scss";
import "./releases.scss";

import React, { Component } from "react";
import type { RouteComponentProps } from "react-router";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { navigation } from "../../navigation";
import type { ReleaseRouteParams } from "../../../common/routes";
import { releaseURL } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import { ItemListLayout } from "../item-object-list";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { kebabCase } from "lodash/fp";
import { HelmReleaseMenu } from "./release-menu";
import type { ItemStore } from "../../../common/item.store";
import { ReleaseRollbackDialog } from "./release-rollback-dialog";
import { ReleaseDetails } from "./release-details/release-details";
import removableReleasesInjectable from "./removable-releases.injectable";
import type { RemovableHelmRelease } from "./removable-releases";
import type { IComputedValue } from "mobx";
import releasesInjectable from "./releases.injectable";

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

interface Dependencies {
  releases: IComputedValue<RemovableHelmRelease[]>;
  releasesArePending: IComputedValue<boolean>;
  selectNamespace: (namespace: string) => void;
}

class NonInjectedHelmReleases extends Component<Dependencies & Props> {
  componentDidMount() {
    const { match: { params: { namespace }}} = this.props;

    if (namespace) {
      this.props.selectNamespace(namespace);
    }
  }

  onDetails = (item: HelmRelease) => {
    this.showDetails(item);
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
    const releases = this.props.releases;
    const releasesArePending = this.props.releasesArePending;

    // TODO: Implement ItemListLayout without stateful stores
    const legacyReleaseStore = {
      get items() {
        return releases.get();
      },

      loadAll: () => Promise.resolve(),

      get isLoaded() {
        return !releasesArePending.get();
      },

      failedLoading: false,

      getTotalCount: () => releases.get().length,

      toggleSelection: (item) => {
        item.toggle();
      },

      isSelectedAll: (visibleItems: RemovableHelmRelease[]) => (
        visibleItems.length > 0
        && visibleItems.every((release) => release.isSelected)
      ),

      toggleSelectionAll: (visibleItems: RemovableHelmRelease[]) => {
        let selected = false;

        if (!legacyReleaseStore.isSelectedAll(visibleItems)) {
          selected = true;
        }

        visibleItems.forEach((release) => {
          if (release.isSelected !== selected) {
            release.toggle();
          }
        });
      },

      isSelected: (item) => item.isSelected,

      get selectedItems() {
        return releases.get().filter((release) => release.isSelected);
      },

      pickOnlySelected: (releases) => {
        return releases.filter(release => release.isSelected);
      },

      removeItems: async (releases) => {
        await Promise.all(releases.map(release => release.delete()));
      },
    } as ItemStore<RemovableHelmRelease>;

    return (
      <>
        <ItemListLayout
          store={legacyReleaseStore}
          getItems={() => legacyReleaseStore.items}
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
          onDetails={this.onDetails}
        />

        <ReleaseDetails
          hideDetails={this.hideDetails}
        />

        <ReleaseRollbackDialog/>
      </>
    );
  }
}

export const HelmReleases = withInjectables<Dependencies, Props>(
  NonInjectedHelmReleases,

  {
    getProps: (di, props) => ({
      releases: di.inject(removableReleasesInjectable),
      releasesArePending: di.inject(releasesInjectable).pending,
      selectNamespace: di.inject(namespaceStoreInjectable).selectNamespaces,
      ...props,
    }),
  },
);
