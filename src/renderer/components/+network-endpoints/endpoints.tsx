import "./endpoints.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router-dom";
import { EndpointRouteParams } from "./endpoints.route";
import { Endpoint } from "../../api/endpoints/endpoint.api";
import { endpointStore } from "./endpoints.store";
import { KubeObjectListLayout } from "../kube-object";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

enum columnId {
  name = "name",
  namespace = "namespace",
  endpoints = "endpoints",
  age = "age",
}

interface Props extends RouteComponentProps<EndpointRouteParams> {
}

@observer
export class Endpoints extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="network_endpoints"
        className="Endpoints" store={endpointStore}
        sortingCallbacks={{
          [columnId.name]: (endpoint: Endpoint) => endpoint.getName(),
          [columnId.namespace]: (endpoint: Endpoint) => endpoint.getNs(),
          [columnId.age]: (endpoint: Endpoint) => endpoint.getTimeDiffFromNow(),
        }}
        searchFilters={[
          (endpoint: Endpoint) => endpoint.getSearchFields()
        ]}
        renderHeaderTitle="Endpoints"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Endpoints", className: "endpoints", id: columnId.endpoints },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(endpoint: Endpoint) => [
          endpoint.getName(),
          <KubeObjectStatusIcon key="icon" object={endpoint} />,
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
    );
  }
}
