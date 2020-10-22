import "./network-policies.scss"

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router-dom";
import { NetworkPolicy, networkPolicyApi } from "../../api/endpoints/network-policy.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { INetworkPoliciesRouteParams } from "./network-policies.route";
import { networkPolicyStore } from "./network-policy.store";
import { apiManager } from "../../api/api-manager";

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
        renderHeaderTitle={<Trans>Network Policies</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Policy Types</Trans>, className: "type" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(item: NetworkPolicy) => [
          item.getName(),
          item.getNs(),
          item.getTypes().join(", "),
          item.getAge(),
        ]}
      />
    )
  }
}
