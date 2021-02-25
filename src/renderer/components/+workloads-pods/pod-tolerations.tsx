import "./pod-tolerations.scss";
import React from "react";
import uniqueId from "lodash/uniqueId";

import { IToleration } from "../../api/workload-kube-object";
import { Table, TableCell, TableHead, TableRow } from "../table";

interface Props {
  tolerations: IToleration[];
}

enum sortBy {
  Key = "key",
  Operator = "operator",
  Effect = "effect",
  Seconds = "seconds",
}

const sortingCallbacks = {
  [sortBy.Key]: (toleration: IToleration) => toleration.key,
  [sortBy.Operator]: (toleration: IToleration) => toleration.operator,
  [sortBy.Effect]: (toleration: IToleration) => toleration.effect,
  [sortBy.Seconds]: (toleration: IToleration) => toleration.tolerationSeconds,
};

const getTableRow = (toleration: IToleration) => {
  const { key, operator, effect, tolerationSeconds } = toleration;

  return (
    <TableRow
      key={uniqueId("toleration-")}
      sortItem={toleration}
      nowrap
    >
      <TableCell className="key">{key}</TableCell>
      <TableCell className="operator">{operator}</TableCell>
      <TableCell className="effect">{effect}</TableCell>
      <TableCell className="seconds">{tolerationSeconds}</TableCell>
    </TableRow>
  );
};

export function PodTolerations({ tolerations }: Props) {
  return (
    <Table
      selectable
      scrollable={false}
      sortable={sortingCallbacks}
      sortSyncWithUrl={false}
      className="PodTolerations"
    >
      <TableHead sticky={false}>
        <TableCell className="key" sortBy={sortBy.Key}>Key</TableCell>
        <TableCell className="operator" sortBy={sortBy.Operator}>Operator</TableCell>
        <TableCell className="effect" sortBy={sortBy.Effect}>Effect</TableCell>
        <TableCell className="seconds" sortBy={sortBy.Seconds}>Seconds</TableCell>
      </TableHead>
      {
        tolerations.map(getTableRow)
      }
    </Table>
  );
}
