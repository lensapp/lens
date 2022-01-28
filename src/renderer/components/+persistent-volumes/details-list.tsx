/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PersistentVolume } from "../../../common/k8s-api/endpoints/persistent-volume.api";
import { TableRow } from "../table/table-row";
import { cssNames, prevDefault } from "../../utils";
import { showDetails } from "../kube-detail-params";
import { TableCell } from "../table/table-cell";
import { Spinner } from "../spinner/spinner";
import { DrawerTitle } from "../drawer/drawer-title";
import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import kebabCase from "lodash/kebabCase";
import { withInjectables } from "@ogre-tools/injectable-react";

export interface PersistentVolumeDetailsListProps {
  persistentVolumes: PersistentVolume[];
  isLoaded: boolean;
}

enum sortBy {
  name = "name",
  status = "status",
  capacity = "capacity",
}

interface Dependencies {

}

const NonInjectedPersistentVolumeDetailsList = observer(({ persistentVolumes, isLoaded }: Dependencies & PersistentVolumeDetailsListProps) => {
  const getTableRow = (uid: string) => {
    const volume = persistentVolumes.find(volume => volume.getId() === uid);

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

  const virtual = persistentVolumes.length > 100;

  if (!persistentVolumes.length) {
    return !isLoaded && <Spinner center/>;
  }

  return (
    <div className="VolumeDetailsList flex column">
      <DrawerTitle title="Persistent Volumes"/>
      <Table
        tableId="storage_volume_details_list"
        items={persistentVolumes}
        selectable
        virtual={virtual}
        sortable={{
          [sortBy.name]: (volume: PersistentVolume) => volume.getName(),
          [sortBy.capacity]: (volume: PersistentVolume) => volume.getCapacity(),
          [sortBy.status]: (volume: PersistentVolume) => volume.getStatus(),
        }}
        sortByDefault={{ sortBy: sortBy.name, orderBy: "desc" }}
        sortSyncWithUrl={false}
        getTableRow={getTableRow}
        className="box grow"
      >
        <TableHead>
          <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
          <TableCell className="capacity" sortBy={sortBy.capacity}>Capacity</TableCell>
          <TableCell className="status" sortBy={sortBy.status}>Status</TableCell>
        </TableHead>
        {
          !virtual && persistentVolumes.map(volume => getTableRow(volume.getId()))
        }
      </Table>
    </div>
  );
});

export const PersistentVolumeDetailsList = withInjectables<Dependencies, PersistentVolumeDetailsListProps>(NonInjectedPersistentVolumeDetailsList, {
  getProps: (di, props) => ({

    ...props,
  }),
});
