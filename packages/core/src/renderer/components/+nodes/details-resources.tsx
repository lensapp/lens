/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-resources.scss";

import { Table } from "../table/table";
import { TableHead } from "../table/table-head";
import { TableRow } from "../table/table-row";
import React from "react";
import type { Node } from "../../../common/k8s-api/endpoints";
import { TableCell } from "../table/table-cell";

export interface NodeDetailsResourcesProps {
  node: Node;
  type: "allocatable" | "capacity";
}

function toMi(resource: string | undefined) {
  if (resource?.endsWith("Ki")) {
    return `${(parseInt(resource) / 1024).toFixed(1)}Mi`;
  }

  return resource;
}

export function NodeDetailsResources({ type, node: { status = {}}}: NodeDetailsResourcesProps) {
  const resourceStatus = status[type];

  if (!resourceStatus) {
    return null;
  }

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
          <TableCell className="cpu">{resourceStatus.cpu}</TableCell>
          <TableCell className="memory">{toMi(resourceStatus.memory)}</TableCell>
          <TableCell
            className="ephemeral-storage"
          >
            {toMi(resourceStatus["ephemeral-storage"])}
          </TableCell>
          <TableCell className="hugepages-1Gi">{resourceStatus["hugepages-1Gi"]}</TableCell>
          <TableCell className="hugepages-2Mi">{resourceStatus["hugepages-2Mi"]}</TableCell>
          <TableCell className="pods">{resourceStatus.pods}</TableCell>
        </TableRow>
      </Table>
    </div>
  );
}
