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

import "./volume-details-list.scss";

import React from "react";
import { observer } from "mobx-react";
import type { PersistentVolume } from "../../api/endpoints/persistent-volume.api";
import { boundMethod } from "../../../common/utils/autobind";
import { TableRow } from "../table/table-row";
import { cssNames, prevDefault } from "../../utils";
import { showDetails } from "../kube-object/kube-object-details";
import { TableCell } from "../table/table-cell";
import { Spinner } from "../spinner/spinner";
import { DrawerTitle } from "../drawer/drawer-title";
import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import { volumesStore } from "./volumes.store";
import kebabCase from "lodash/kebabCase";

interface Props {
  persistentVolumes: PersistentVolume[];
}

enum sortBy {
  name = "name",
  status = "status",
  capacity = "capacity",
}

@observer
export class VolumeDetailsList extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (volume: PersistentVolume) => volume.getName(),
    [sortBy.capacity]: (volume: PersistentVolume) => volume.getCapacity(),
    [sortBy.status]: (volume: PersistentVolume) => volume.getStatus(),
  };

  @boundMethod
  getTableRow(uid: string) {
    const { persistentVolumes } = this.props;
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
  }

  render() {
    const { persistentVolumes } = this.props;
    const virtual = persistentVolumes.length > 100;

    if (!persistentVolumes.length) {
      return !volumesStore.isLoaded && <Spinner center/>;
    }

    return (
      <div className="VolumeDetailsList flex column">
        <DrawerTitle title="Persistent Volumes"/>
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
