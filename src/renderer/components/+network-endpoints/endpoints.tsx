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

import "./endpoints.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router-dom";
import { endpointStore } from "./endpoints.store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { EndpointRouteParams } from "../../../common/routes";

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
          [columnId.name]: endpoint => endpoint.getName(),
          [columnId.namespace]: endpoint => endpoint.getNs(),
          [columnId.age]: endpoint => endpoint.getTimeDiffFromNow(),
        }}
        searchFilters={[
          endpoint => endpoint.getSearchFields(),
        ]}
        renderHeaderTitle="Endpoints"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Endpoints", className: "endpoints", id: columnId.endpoints },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={endpoint => [
          endpoint.getName(),
          <KubeObjectStatusIcon key="icon" object={endpoint} />,
          endpoint.getNs(),
          endpoint.toString(),
          endpoint.getAge(),
        ]}
        tableProps={{
          customRowHeights: (item, lineHeight, paddings) => {
            const lines = item.getEndpointSubsets().length || 1;

            return lines * lineHeight + paddings;
          },
        }}
      />
    );
  }
}
