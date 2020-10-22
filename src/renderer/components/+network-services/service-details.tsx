import "./service-details.scss"

import React from "react";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../kube-object";
import { Service, endpointApi } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { ServicePortComponent } from "./service-port-component";
import { endpointStore } from "../+network-endpoints/endpoints.store";
import { ServiceDetailsEndpoint } from "./service-details-endpoint";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Service> {
}

@observer
export class ServiceDetails extends React.Component<Props> {
  componentDidMount() {
    if (!endpointStore.isLoaded) {
      endpointStore.loadAll();
    }
    endpointApi.watch()
  }

  render() {
    const { object: service } = this.props;
    if (!service) return;
    const { spec } = service;
    const endpoint = endpointStore.getByName(service.getName(), service.getNs())
    return (
      <div className="ServicesDetails">
        <KubeObjectMeta object={service}/>

        <DrawerItem name={<Trans>Selector</Trans>} labelsOnly>
          {service.getSelector().map(selector => <Badge key={selector} label={selector}/>)}
        </DrawerItem>

        <DrawerItem name={<Trans>Type</Trans>}>
          {spec.type}
        </DrawerItem>

        <DrawerItem name={<Trans>Session Affinity</Trans>}>
          {spec.sessionAffinity}
        </DrawerItem>

        <DrawerTitle title={_i18n._(t`Connection`)}/>

        <DrawerItem name={<Trans>Cluster IP</Trans>}>
          {spec.clusterIP}
        </DrawerItem>

        {service.getExternalIps().length > 0 && (
          <DrawerItem name={<Trans>External IPs</Trans>}>
            {service.getExternalIps().map(ip => <div key={ip}>{ip}</div>)}
          </DrawerItem>
        )}

        <DrawerItem name={<Trans>Ports</Trans>}>
          <div>
            {
              service.getPorts().map((port) => (
                <ServicePortComponent service={service} port={port} key={port.toString()}/>
              ))
            }
          </div>
        </DrawerItem>

        {spec.type === "LoadBalancer" && spec.loadBalancerIP && (
          <DrawerItem name={<Trans>Load Balancer IP</Trans>}>
            {spec.loadBalancerIP}
          </DrawerItem>
        )}
        <DrawerTitle title={_i18n._(t`Endpoint`)}/>

        <ServiceDetailsEndpoint endpoint={endpoint} />

        <KubeEventDetails object={service}/>
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
})
