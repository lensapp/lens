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

import "./revision-history.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ControllerRevision } from "../../../common/k8s-api/endpoints/controller-revision.api";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
  revision = "revision",
}

interface Props {
  object: ControllerRevision[];
}

@observer
export class RevisionHistory extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (object: ControllerRevision) => object.getName(),
    [sortBy.namespace]: (object: ControllerRevision) => object.getNs(),
    [sortBy.age]: (object: ControllerRevision) => object.metadata.creationTimestamp,
    [sortBy.revision]: (object: ControllerRevision) => object.getRevisionNumber(),
  };

  render() {
    const { object } = this.props;

    if (!object.length) return null;

    return (
      <div className="RevisionHistory flex column">
        <DrawerTitle title="Revision history"/>
        <Table
          tableId="revision_history"
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.revision, orderBy: "desc" }}
          sortSyncWithUrl={false}
          className="box grow"
        >
          <TableHead>
            <TableCell className="revision" sortBy={sortBy.revision}>Revision</TableCell>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="warning"/>
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell className="age" sortBy={sortBy.age}>Age</TableCell>
          </TableHead>
          {
            object.map(object => {
              return (
                <TableRow
                  key={object.getId()}
                  sortItem={object}
                  nowrap
                >
                  <TableCell className="revision">{object.getRevisionNumber()}</TableCell>
                  <TableCell className="name">{object.getName()}</TableCell>
                  <TableCell className="warning"><KubeObjectStatusIcon key="icon" object={object}/></TableCell>
                  <TableCell className="namespace">{object.getNs()}</TableCell>
                  <TableCell className="age">{object.getAge()}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}
