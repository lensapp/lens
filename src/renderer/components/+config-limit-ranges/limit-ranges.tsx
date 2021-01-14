import "./limit-ranges.scss";

import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object/kube-object-list-layout";
import { limitRangeStore } from "./limit-ranges.store";
import { LimitRangeRouteParams } from "./limit-ranges.route";
import React from "react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LimitRange } from "../../api/endpoints/limit-range.api";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<LimitRangeRouteParams> {
}

@observer
export class LimitRanges extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="LimitRanges"
        store={limitRangeStore}
        sortingCallbacks={{
          [sortBy.name]: (item: LimitRange) => item.getName(),
          [sortBy.namespace]: (item: LimitRange) => item.getNs(),
          [sortBy.age]: (item: LimitRange) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: LimitRange) => item.getName(),
          (item: LimitRange) => item.getNs(),
        ]}
        renderHeaderTitle={"Limit Ranges"}
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(limitRange: LimitRange) => [
          limitRange.getName(),
          <KubeObjectStatusIcon key="icon" object={limitRange}/>,
          limitRange.getNs(),
          limitRange.getAge(),
        ]}
      />
    );
  }
}
