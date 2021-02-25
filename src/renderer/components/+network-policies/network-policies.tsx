import "./network-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { NetworkPolicy } from "../../api/endpoints/network-policy.api";
import { KubeObjectListLayout } from "../kube-object";
import { INetworkPoliciesRouteParams } from "./network-policies.route";
import { networkPolicyStore } from "./network-policy.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  types = "types",
  age = "age",
}

interface Props extends RouteComponentProps<INetworkPoliciesRouteParams> {
}

@observer
export class NetworkPolicies extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="network_policies"
        className="NetworkPolicies" store={networkPolicyStore}
        sortingCallbacks={{
          [columnId.name]: (item: NetworkPolicy) => item.getName(),
          [columnId.namespace]: (item: NetworkPolicy) => item.getNs(),
          [columnId.age]: (item: NetworkPolicy) => item.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (item: NetworkPolicy) => item.getSearchFields(),
        ]}
        renderHeaderTitle="Network Policies"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Policy Types", className: "type", id: columnId.types },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(item: NetworkPolicy) => [
          item.getName(),
          <KubeObjectStatusIcon key="icon" object={item} />,
          item.getNs(),
          item.getTypes().join(", "),
          item.getAge(),
        ]}
      />
    );
  }
}
