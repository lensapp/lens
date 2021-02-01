import "./service-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../kube-object";
import { Service } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { ServicePortComponent } from "./service-port-component";
import { endpointStore } from "../+network-endpoints/endpoints.store";
import { ServiceDetailsEndpoint } from "./service-details-endpoint";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { kubeWatchApi } from "../../api/kube-watch-api";

interface Props extends KubeObjectDetailsProps<Service> {
}

@observer
export class ServiceDetails extends React.Component<Props> {
  componentDidMount() {
    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores([endpointStore], {
        preload: true,
      }),
    ]);
  }

  render() {
    const { object: service } = this.props;

    if (!service) return;
    const { spec } = service;
    const endpoint = endpointStore.getByName(service.getName(), service.getNs());

    return (
      <div className="ServicesDetails">
        <KubeObjectMeta object={service}/>

        <DrawerItem name="Selector" labelsOnly>
          {service.getSelector().map(selector => <Badge key={selector} label={selector}/>)}
        </DrawerItem>

        <DrawerItem name="Type">
          {spec.type}
        </DrawerItem>

        <DrawerItem name="Session Affinity">
          {spec.sessionAffinity}
        </DrawerItem>

        <DrawerTitle title={`Connection`}/>

        <DrawerItem name="Cluster IP">
          {spec.clusterIP}
        </DrawerItem>

        {service.getExternalIps().length > 0 && (
          <DrawerItem name="External IPs">
            {service.getExternalIps().map(ip => <div key={ip}>{ip}</div>)}
          </DrawerItem>
        )}

        <DrawerItem name="Ports">
          <div>
            {
              service.getPorts().map((port) => (
                <ServicePortComponent service={service} port={port} key={port.toString()}/>
              ))
            }
          </div>
        </DrawerItem>

        {spec.type === "LoadBalancer" && spec.loadBalancerIP && (
          <DrawerItem name="Load Balancer IP">
            {spec.loadBalancerIP}
          </DrawerItem>
        )}
        <DrawerTitle title={`Endpoint`}/>

        <ServiceDetailsEndpoint endpoint={endpoint}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Service",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <ServiceDetails {...props} />
  }
});

kubeObjectDetailRegistry.add({
  kind: "Service",
  apiVersions: ["v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
