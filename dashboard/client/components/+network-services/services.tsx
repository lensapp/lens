import "./services.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { RouteComponentProps } from "react-router";
import { ServicesRouteParams } from "./services.route";
import { Service, serviceApi } from "../../api/endpoints/service.api";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { KubeObjectListLayout } from "../kube-object";
import { Badge } from "../badge";
import { serviceStore } from "./services.store";
import { apiManager } from "../../api/api-manager";

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

interface Props extends RouteComponentProps<ServicesRouteParams> {
}

@observer
export class Services extends React.Component<Props> {
  render(): JSX.Element {
    return (
      <KubeObjectListLayout
        className="Services" store={serviceStore}
        sortingCallbacks={{
          [sortBy.name]: (service: Service): string => service.getName(),
          [sortBy.namespace]: (service: Service): string => service.getNs(),
          [sortBy.selector]: (service: Service): string[] => service.getSelector(),
          [sortBy.ports]: (service: Service): number => (service.spec.ports || []).map(({ port }) => port)[0],
          [sortBy.clusterIp]: (service: Service): string => service.getClusterIp(),
          [sortBy.type]: (service: Service): string => service.getType(),
          [sortBy.age]: (service: Service): string => service.metadata.creationTimestamp,
          [sortBy.status]: (service: Service): string => service.getStatus(),
        }}
        searchFilters={[
          (service: Service): string[] => service.getSearchFields(),
          (service: Service): string => service.getSelector().join(" "),
          (service: Service): string => service.getPorts().join(" "),
        ]}
        renderHeaderTitle={<Trans>Services</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
          { title: <Trans>Cluster IP</Trans>, className: "clusterIp", sortBy: sortBy.clusterIp, },
          { title: <Trans>Ports</Trans>, className: "ports", sortBy: sortBy.ports },
          { title: <Trans>External IP</Trans>, className: "externalIp" },
          { title: <Trans>Selector</Trans>, className: "selector", sortBy: sortBy.selector },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
          { title: <Trans>Status</Trans>, className: "status", sortBy: sortBy.status },
        ]}
        renderTableContents={(service: Service): (string | number | JSX.Element[] | React.ReactNode)[] => [
          service.getName(),
          service.getNs(),
          service.getType(),
          service.spec.clusterIP,
          service.getPorts().join(", "),
          service.getExternalIps().join(", ") || "-",
          service.getSelector().map(label => <Badge key={label} label={label}/>),
          service.getAge(),
          { title: service.getStatus(), className: service.getStatus().toLowerCase() },
        ]}
        renderItemMenu={(item: Service): JSX.Element => {
          return <ServiceMenu object={item}/>;
        }}
      />
    );
  }
}

export function ServiceMenu(props: KubeObjectMenuProps<Service>): JSX.Element {
  return (
    <KubeObjectMenu {...props}/>
  );
}

apiManager.registerViews(serviceApi, {
  Menu: ServiceMenu
});
