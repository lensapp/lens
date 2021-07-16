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

import "./node-details-resources.scss";

import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import { TableRow } from "../table/table-row";
import React from "react";
import type { Node } from "../../api/endpoints";
import { TableCell } from "../table/table-cell";

interface Props {
  node: Node;
  type: "allocatable" | "capacity";
}

export class NodeDetailsResources extends React.Component<Props> {
  toMi(resource: string) {
    if (resource?.endsWith("Ki")) {
      return `${(parseInt(resource) / 1024).toFixed(1)}Mi`;
    }

    return resource;
  }

  render() {
    const status = this.props.node.status;
    const type = this.props.type;

    if (!status) return null;

    return (
      <div className="NodeDetailsResources flex column">
        <Table
          selectable
          scrollable={false}
        >
          <TableHead sticky={false}>
            <TableCell className="cpu">CPU</TableCell>
            <TableCell className="memory">Memory</TableCell>
            <TableCell className="ephemeral-storage">Ephemeral Storage</TableCell>
            <TableCell className="hugepages-1Gi">Hugepages-1Gi</TableCell>
            <TableCell className="hugepages-2Mi">Hugepages-2Mi</TableCell>
            <TableCell className="pods">Pods</TableCell>
          </TableHead>
          <TableRow>
            <TableCell className="cpu">{status[type].cpu}</TableCell>
            <TableCell className="memory">{this.toMi(status[type].memory)}</TableCell>
            <TableCell
              className="ephemeral-storage">{this.toMi(status[type]["ephemeral-storage"])}</TableCell>
            <TableCell className="hugepages-1Gi">{status[type]["hugepages-1Gi"]}</TableCell>
            <TableCell className="hugepages-2Mi">{status[type]["hugepages-2Mi"]}</TableCell>
            <TableCell className="pods">{status[type].pods}</TableCell>
          </TableRow>
        </Table>
      </div>
    );
  }
}
