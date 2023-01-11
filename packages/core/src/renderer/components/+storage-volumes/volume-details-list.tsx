/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-details-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PersistentVolume } from "../../../common/k8s-api/endpoints/persistent-volume.api";
import { TableRow } from "../table/table-row";
import { cssNames, prevDefault } from "../../utils";
import { TableCell } from "../table/table-cell";
import { Spinner } from "../spinner/spinner";
import { DrawerTitle } from "../drawer/drawer-title";
import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import kebabCase from "lodash/kebabCase";
import type { PersistentVolumeStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import persistentVolumeStoreInjectable from "./store.injectable";
import type { ShowDetails } from "../kube-detail-params/show-details.injectable";
import showDetailsInjectable from "../kube-detail-params/show-details.injectable";

export interface VolumeDetailsListProps {
  persistentVolumes: PersistentVolume[];
}

enum sortBy {
  name = "name",
  status = "status",
  capacity = "capacity",
}

interface Dependencies {
  persistentVolumeStore: PersistentVolumeStore;
  showDetails: ShowDetails;
}

@observer
class NonInjectedVolumeDetailsList extends React.Component<VolumeDetailsListProps & Dependencies> {
  private sortingCallbacks = {
    [sortBy.name]: (volume: PersistentVolume) => volume.getName(),
    [sortBy.capacity]: (volume: PersistentVolume) => volume.getCapacity(),
    [sortBy.status]: (volume: PersistentVolume) => volume.getStatus(),
  };

  getTableRow = (uid: string) => {
    const { persistentVolumes, showDetails } = this.props;
    const volume = persistentVolumes.find(volume => volume.getId() === uid);

    if (!volume) {
      return undefined;
    }

    return (
      <TableRow
        key={volume.getId()}
        sortItem={volume}
        nowrap
        onClick={prevDefault(() => showDetails(volume.selfLink, false))}
      >
        <TableCell className="name">{volume.getName()}</TableCell>
        <TableCell className="capacity">{volume.getCapacity()}</TableCell>
        <TableCell className={cssNames("status", kebabCase(volume.getStatus()))}>{volume.getStatus()}</TableCell>
      </TableRow>
    );
  };

  render() {
    const { persistentVolumes, persistentVolumeStore } = this.props;
    const virtual = persistentVolumes.length > 100;

    if (!persistentVolumes.length) {
      return !persistentVolumeStore.isLoaded && <Spinner center/>;
    }

    return (
      <div className="VolumeDetailsList flex column">
        <DrawerTitle>Persistent Volumes</DrawerTitle>
        <Table
          tableId="storage_volume_details_list"
          items={persistentVolumes}
          selectable
          virtual={virtual}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "desc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="capacity" sortBy={sortBy.capacity}>Capacity</TableCell>
            <TableCell className="status" sortBy={sortBy.status}>Status</TableCell>
          </TableHead>
          {
            !virtual && persistentVolumes.map(volume => this.getTableRow(volume.getId()))
          }
        </Table>
      </div>
    );
  }
}

export const VolumeDetailsList = withInjectables<Dependencies, VolumeDetailsListProps>(NonInjectedVolumeDetailsList, {
  getProps: (di, props) => ({
    ...props,
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    showDetails: di.inject(showDetailsInjectable),
  }),
});
