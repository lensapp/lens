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

import "./pod-tolerations.scss";
import React from "react";
import uniqueId from "lodash/uniqueId";

import type { IToleration } from "../../api/workload-kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";

interface Props {
  tolerations: IToleration[];
}

enum sortBy {
  Key = "key",
  Operator = "operator",
  Effect = "effect",
  Seconds = "seconds",
  Value = "value",
}

const getTableRow = (toleration: IToleration) => {
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

export function PodTolerations({ tolerations }: Props) {
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
