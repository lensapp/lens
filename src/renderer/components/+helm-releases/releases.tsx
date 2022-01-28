/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./releases.scss";

import React, { useEffect } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { HelmRelease } from "../../../common/k8s-api/endpoints/helm-release.api";
import { ReleaseDetails } from "./details";
import { ReleaseRollbackDialog } from "./rollback-dialog/rollback-dialog";
import { ItemListLayout } from "../item-object-list/item-list-layout";
import { HelmReleaseMenu } from "./item-menu";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import type { ReleaseRouteParams } from "../../../common/routes";
import { releaseURL } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import selectSingleNamespaceInjectable from "../+namespaces/select-single-namespace.injectable";
import type { IComputedValue } from "mobx";
import type { RemovableHelmRelease } from "./removable-releases";
import type { ObservableHistory } from "mobx-observable-history";
import releasesInjectable from "./releases.injectable";
import removableReleasesInjectable from "./removable-releases.injectable";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";
import type { ItemStore } from "../../../common/item.store";
import { Spinner } from "../spinner";

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

export interface HelmReleasesProps extends RouteComponentProps<ReleaseRouteParams> {
}

interface Dependencies {
  releases: IComputedValue<RemovableHelmRelease[]>;
  releasesArePending: IComputedValue<boolean>;
  selectSingleNamespace: (ns: string) => void;
  navigation: ObservableHistory;
}

const NonInjectedHelmReleases = observer(({ releases, releasesArePending, navigation, selectSingleNamespace, match }: Dependencies & HelmReleasesProps) => {
  const { params: { namespace, name }} = match;
  const selectedRelease = releases.get().find(release => release.getName() === name && release.getNs() === namespace);

  // TODO: Implement ItemListLayout without stateful stores
  const legacyReleaseStore = {
    get items() {
      return releases.get();
    },

    loadAll: () => Promise.resolve(),
    isLoaded: true,
    failedLoading: false,

    getTotalCount: () => releases.get().length,

    toggleSelection: (item) => {
      item.toggle();
    },

    isSelectedAll: () =>
      releases.get().every((release) => release.isSelected),

    toggleSelectionAll: () => {
      releases.get().forEach((release) => release.toggle());
    },

    isSelected: (item) => item.isSelected,

    get selectedItems() {
      return releases.get().filter((release) => release.isSelected);
    },

    removeSelectedItems() {
      return Promise.all(
        releases.get().filter((release) => release.isSelected).map((release) => release.delete()),
      );
    },
  } as ItemStore<RemovableHelmRelease>;

  useEffect(() => {
    if (namespace) {
      selectSingleNamespace(namespace);
    }
  }, []);

  const showDetails = (item: HelmRelease) => {
    navigation.push(releaseURL({
      params: {
        name: item.getName(),
        namespace: item.getNs(),
      },
    }));
  };
  const hideDetails = () => {
    navigation.push(releaseURL());
  };
  const onDetails = (item: HelmRelease) => {
    if (item === selectedRelease) {
      hideDetails();
    } else {
      showDetails(item);
    }
  };
  const renderRemoveDialogMessage = (selectedItems: HelmRelease[]) => (
    <div>
      <>Remove <b>{selectedItems.map(item => item.getName()).join(", ")}</b>?</>
      <p className="warning">
          Note: StatefulSet Volumes won&apos;t be deleted automatically
      </p>
    </div>
  );

  if (releasesArePending.get()) {
    // TODO: Make Spinner "center" work properly
    return <div className="flex center" style={{ height: "100%" }}><Spinner /></div>;
  }

  return (
    <>
      <ItemListLayout
        isConfigurable
        tableId="helm_releases"
        className="HelmReleases"
        store={legacyReleaseStore}
        preloadStores={false}
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
            removeConfirmationMessage={renderRemoveDialogMessage([release])}
          />
        )}
        customizeRemoveDialog={selectedItems => ({
          message: renderRemoveDialogMessage(selectedItems),
        })}
        onDetails={onDetails}
      />
      <ReleaseDetails hideDetails={hideDetails} />
      <ReleaseRollbackDialog/>
    </>
  );
});

export const HelmReleases = withInjectables<Dependencies, HelmReleasesProps>(NonInjectedHelmReleases, {
  getProps: (di, props) => ({
    selectSingleNamespace: di.inject(selectSingleNamespaceInjectable),
    releases: di.inject(removableReleasesInjectable),
    releasesArePending: di.inject(releasesInjectable).pending,
    navigation: di.inject(observableHistoryInjectable),
    ...props,
  }),
});
