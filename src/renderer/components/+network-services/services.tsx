/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./services.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { serviceStore } from "./services.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { KubeObjectAge } from "../kube-object/age";

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

@observer
export class Services extends React.Component {
  render() {
    return (
      <SiblingsInTabLayout>
        <KubeObjectListLayout
          isConfigurable
          tableId="network_services"
          className="Services"
          store={serviceStore}
          sortingCallbacks={{
            [columnId.name]: service => service.getName(),
            [columnId.namespace]: service => service.getNs(),
            [columnId.selector]: service => service.getSelector(),
            [columnId.ports]: service => (service.spec.ports || []).map(({ port }) => port)[0],
            [columnId.clusterIp]: service => service.getClusterIp(),
            [columnId.type]: service => service.getType(),
            [columnId.age]: service => -service.getCreationTimestamp(),
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
          renderTableContents={service => {
            const externalIps = service.getExternalIps();

            if (externalIps.length === 0 && service.spec?.externalName) {
              externalIps.push(service.spec.externalName);
            }

            return [
              service.getName(),
              <KubeObjectStatusIcon key="icon" object={service} />,
              service.getNs(),
              service.getType(),
              service.getClusterIp(),
              service.getPorts().join(", "),
              externalIps.join(", ") || "-",
              service.getSelector().map(label => <Badge key={label} label={label} />),
              <KubeObjectAge key="age" object={service} />,
              { title: service.getStatus(), className: service.getStatus().toLowerCase() },
            ];
          }}
        />
      </SiblingsInTabLayout>
    );
  }
}
