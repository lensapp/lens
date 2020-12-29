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

enum sortBy {
  name = "name",
  namespace = "namespace",
  selector = "selector",
  ports = "port",
  clusterIp = "cluster-ip",
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
        className="Services" store={serviceStore}
        sortingCallbacks={{
          [sortBy.name]: (service: Service) => service.getName(),
          [sortBy.namespace]: (service: Service) => service.getNs(),
          [sortBy.selector]: (service: Service) => service.getSelector(),
          [sortBy.ports]: (service: Service) => (service.spec.ports || []).map(({ port }) => port)[0],
          [sortBy.clusterIp]: (service: Service) => service.getClusterIp(),
          [sortBy.type]: (service: Service) => service.getType(),
          [sortBy.age]: (service: Service) => service.metadata.creationTimestamp,
          [sortBy.status]: (service: Service) => service.getStatus(),
        }}
        searchFilters={[
          (service: Service) => service.getSearchFields(),
          (service: Service) => service.getSelector().join(" "),
          (service: Service) => service.getPorts().join(" "),
        ]}
        renderHeaderTitle="Services"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { className: "warning" },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Type", className: "type", sortBy: sortBy.type },
          { title: "Cluster IP", className: "clusterIp", sortBy: sortBy.clusterIp, },
          { title: "Ports", className: "ports", sortBy: sortBy.ports },
          { title: "External IP", className: "externalIp" },
          { title: "Selector", className: "selector", sortBy: sortBy.selector },
          { title: "Age", className: "age", sortBy: sortBy.age },
          { title: "Status", className: "status", sortBy: sortBy.status },
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
