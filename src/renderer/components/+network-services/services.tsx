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

import "./services.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { serviceStore } from "./services.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ServicesRouteParams } from "../../../common/routes";

enum columnId {
  name = "name",
  namespace = "namespace",
  selector = "selector",
  ports = "port",
  clusterIp = "cluster-ip",
  externalIp = "external-ip",
  age = "age",
  type = "type",
  status = "status",
}

interface Props extends RouteComponentProps<ServicesRouteParams> {
}

@observer
export class Services extends React.Component<Props> {
  render() {
    return (
      <KubeObjectListLayout
        isConfigurable
        tableId="network_services"
        className="Services" store={serviceStore}
        sortingCallbacks={{
          [columnId.name]: service => service.getName(),
          [columnId.namespace]: service => service.getNs(),
          [columnId.selector]: service => service.getSelector(),
          [columnId.ports]: service => (service.spec.ports || []).map(({ port }) => port)[0],
          [columnId.clusterIp]: service => service.getClusterIp(),
          [columnId.type]: service => service.getType(),
          [columnId.age]: service => service.getTimeDiffFromNow(),
          [columnId.status]: service => service.getStatus(),
        }}
        searchFilters={[
          service => service.getSearchFields(),
          service => service.getSelector().join(" "),
          service => service.getPorts().join(" "),
        ]}
        renderHeaderTitle="Services"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Cluster IP", className: "clusterIp", sortBy: columnId.clusterIp, id: columnId.clusterIp },
          { title: "Ports", className: "ports", sortBy: columnId.ports, id: columnId.ports },
          { title: "External IP", className: "externalIp", id: columnId.externalIp },
          { title: "Selector", className: "selector", sortBy: columnId.selector, id: columnId.selector },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
        ]}
        renderTableContents={service => [
          service.getName(),
          <KubeObjectStatusIcon key="icon" object={service} />,
          service.getNs(),
          service.getType(),
          service.getClusterIp(),
          service.getPorts().join(", "),
          service.getExternalIps().join(", ") || "-",
          service.getSelector().map(label => <Badge key={label} label={label}/>),
          service.getAge(),
          { title: service.getStatus(), className: service.getStatus().toLowerCase() },
        ]}
      />
    );
  }
}
