import "./services.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { IServicesRouteParams } from "./services.route";
import { Service } from "../../api/endpoints/service.api";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { serviceStore } from "./services.store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";

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

interface Props extends RouteComponentProps<IServicesRouteParams> {
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
          [columnId.name]: (service: Service) => service.getName(),
          [columnId.namespace]: (service: Service) => service.getNs(),
          [columnId.selector]: (service: Service) => service.getSelector(),
          [columnId.ports]: (service: Service) => (service.spec.ports || []).map(({ port }) => port)[0],
          [columnId.clusterIp]: (service: Service) => service.getClusterIp(),
          [columnId.type]: (service: Service) => service.getType(),
          [columnId.age]: (service: Service) => service.getTimeDiffFromNow(),
          [columnId.status]: (service: Service) => service.getStatus(),
        }}
        searchFilters={[
          (service: Service) => service.getSearchFields(),
          (service: Service) => service.getSelector().join(" "),
          (service: Service) => service.getPorts().join(" "),
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
        renderTableContents={(service: Service) => [
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
