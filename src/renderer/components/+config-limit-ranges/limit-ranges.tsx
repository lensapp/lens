import "./limit-ranges.scss";

import { RouteComponentProps } from "react-router";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object/kube-object-list-layout";
import { limitRangeStore } from "./limit-ranges.store";
import { LimitRangeRouteParams } from "./limit-ranges.route";
import React from "react";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LimitRange } from "../../api/endpoints/limit-range.api";

enum columnId {
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
        isConfigurable
        tableId="configuration_limitranges"
        className="LimitRanges"
        store={limitRangeStore}
        sortingCallbacks={{
          [columnId.name]: (item: LimitRange) => item.getName(),
          [columnId.namespace]: (item: LimitRange) => item.getNs(),
          [columnId.age]: (item: LimitRange) => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (item: LimitRange) => item.getName(),
          (item: LimitRange) => item.getNs(),
        ]}
        renderHeaderTitle={"Limit Ranges"}
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
