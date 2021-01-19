import "./network-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { NetworkPolicy } from "../../api/endpoints/network-policy.api";
import { KubeObjectListLayout } from "../kube-object";
import { INetworkPoliciesRouteParams } from "./network-policies.route";
import { networkPolicyStore } from "./network-policy.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<INetworkPoliciesRouteParams> {
}

@observer
export class NetworkPolicies extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="NetworkPolicies" store={networkPolicyStore}
        sortingCallbacks={{
          [sortBy.name]: (item: NetworkPolicy) => item.getName(),
          [sortBy.namespace]: (item: NetworkPolicy) => item.getNs(),
          [sortBy.age]: (item: NetworkPolicy) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: NetworkPolicy) => item.getSearchFields(),
        ]}
        renderHeaderTitle="Network Policies"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Policy Types", className: "type" },
          { title: "Age", className: "age", sortBy: sortBy.age },
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
