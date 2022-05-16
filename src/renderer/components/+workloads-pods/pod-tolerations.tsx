/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-tolerations.scss";
import React from "react";
import uniqueId from "lodash/uniqueId";

import type { Toleration } from "../../../common/k8s-api/kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";

export interface PodTolerationsProps {
  tolerations: Toleration[];
}

enum sortBy {
  Key = "key",
  Operator = "operator",
  Effect = "effect",
  Seconds = "seconds",
  Value = "value",
}

const getTableRow = (toleration: Toleration) => {
  const { key, operator, effect, tolerationSeconds, value } = toleration;

  return (
    <TableRow
      key={uniqueId("toleration-")}
      sortItem={toleration}
      nowrap
    >
      <TableCell className="key">{key}</TableCell>
      <TableCell className="operator">{operator}</TableCell>
      <TableCell className="value">{value}</TableCell>
      <TableCell className="effect">{effect}</TableCell>
      <TableCell className="seconds">{tolerationSeconds}</TableCell>
    </TableRow>
  );
};

export function PodTolerations({ tolerations }: PodTolerationsProps) {
  return (
    <Table
      tableId="workloads_pod_tolerations"
      selectable
      items={tolerations}
      scrollable={false}
      sortable={{
        [sortBy.Key]: toleration => toleration.key,
        [sortBy.Operator]: toleration => toleration.operator,
        [sortBy.Effect]: toleration => toleration.effect,
        [sortBy.Seconds]: toleration => toleration.tolerationSeconds,
      }}
      sortSyncWithUrl={false}
      className="PodTolerations"
      renderRow={getTableRow}
    >
      <TableHead sticky={false}>
        <TableCell className="key" sortBy={sortBy.Key}>Key</TableCell>
        <TableCell className="operator" sortBy={sortBy.Operator}>Operator</TableCell>
        <TableCell className="value" sortBy={sortBy.Value}>Value</TableCell>
        <TableCell className="effect" sortBy={sortBy.Effect}>Effect</TableCell>
        <TableCell className="seconds" sortBy={sortBy.Seconds}>Seconds</TableCell>
      </TableHead>
    </Table>
  );
}
