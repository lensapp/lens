/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-details.scss";

import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import { TableRow } from "../table/table-row";
import React from "react";
import type { Node } from "../../../common/k8s-api/endpoints";
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
