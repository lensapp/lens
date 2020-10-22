import "./endpoints.scss"

import React from "react"
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom"
import { EndpointRouteParams } from "./endpoints.route"
import { Endpoint, endpointApi } from "../../api/endpoints/endpoint.api"
import { endpointStore } from "./endpoints.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { Trans } from "@lingui/macro";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  age = "age",
}

interface Props extends RouteComponentProps<EndpointRouteParams> {
}

@observer
export class Endpoints extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        className="Endpoints" store={endpointStore}
        sortingCallbacks={{
          [sortBy.name]: (endpoint: Endpoint) => endpoint.getName(),
          [sortBy.namespace]: (endpoint: Endpoint) => endpoint.getNs(),
          [sortBy.age]: (endpoint: Endpoint) => endpoint.metadata.creationTimestamp,
        }}
        searchFilters={[
          (endpoint: Endpoint) => endpoint.getSearchFields()
        ]}
        renderHeaderTitle={<Trans>Endpoints</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Endpoints</Trans>, className: "endpoints" },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(endpoint: Endpoint) => [
          endpoint.getName(),
          endpoint.getNs(),
          endpoint.toString(),
          endpoint.getAge(),
        ]}
        tableProps={{
          customRowHeights: (item: Endpoint, lineHeight, paddings) => {
            const lines = item.getEndpointSubsets().length || 1;
            return lines * lineHeight + paddings;
          }
        }}
      />
    )
  }
}
