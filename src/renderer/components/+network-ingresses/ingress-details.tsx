import "./ingress-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { DrawerItem, DrawerTitle } from "../drawer";
import { ILoadBalancerIngress, Ingress } from "../../api/endpoints";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeEventDetails } from "../+events/kube-event-details";
import { ingressStore } from "./ingress.store";
import { ResourceMetrics } from "../resource-metrics";
import { KubeObjectDetailsProps } from "../kube-object";
import { IngressCharts } from "./ingress-charts";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { getBackendServiceNamePort } from "../../api/endpoints/ingress.api";
import { ResourceType } from "../cluster-settings/components/cluster-metrics-setting";
import { clusterStore } from "../../../common/cluster-store";

interface Props extends KubeObjectDetailsProps<Ingress> {
}

@observer
export class IngressDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    ingressStore.reset();
  });

  componentWillUnmount() {
    ingressStore.reset();
  }

  renderPaths(ingress: Ingress) {
    const { spec: { rules } } = ingress;

    if (!rules || !rules.length) return null;

    return rules.map((rule, index) => {
      return (
        <div className="rules" key={index}>
          {rule.host && (
            <div className="host-title">
              <>Host: {rule.host}</>
            </div>
          )}
          {rule.http && (
            <Table className="paths">
              <TableHead>
                <TableCell className="path">Path</TableCell>
                <TableCell className="backends">Backends</TableCell>
              </TableHead>
              {
                rule.http.paths.map((path, index) => {
                  const { serviceName, servicePort } = getBackendServiceNamePort(path.backend);
                  const backend =`${serviceName}:${servicePort}`;

                  return (
                    <TableRow key={index}>
                      <TableCell className="path">{path.path || ""}</TableCell>
                      <TableCell className="backends">
                        <p key={backend}>{backend}</p>
                      </TableCell>
                    </TableRow>
                  );
                })
              }
            </Table>
          )}
        </div>
      );
    });
  }

  renderIngressPoints(ingressPoints: ILoadBalancerIngress[]) {
    if (!ingressPoints || ingressPoints.length === 0) return null;

    return (
      <div>
        <Table className="ingress-points">
          <TableHead>
            <TableCell className="name" >Hostname</TableCell>
            <TableCell className="ingresspoints">IP</TableCell>
          </TableHead>
          {ingressPoints.map(({hostname, ip}, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="name">{hostname ? hostname : "-"}</TableCell>
                <TableCell className="ingresspoints">{ip ? ip : "-"}</TableCell>
              </TableRow>
            );})
          })
        </Table>
      </div>
    );
  }

  render() {
    const { object: ingress } = this.props;

    if (!ingress) {
      return null;
    }
    const { spec, status } = ingress;
    const ingressPoints = status?.loadBalancer?.ingress;
    const { metrics } = ingressStore;
    const metricTabs = [
      "Network",
      "Duration",
    ];
    const isMetricHidden = clusterStore.isMetricHidden(ResourceType.Ingress);

    const { serviceName, servicePort } = ingress.getServiceNamePort();

    return (
      <div className="IngressDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={() => ingressStore.loadMetrics(ingress)}
            tabs={metricTabs} object={ingress} params={{ metrics }}
          >
            <IngressCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={ingress}/>
        <DrawerItem name="Ports">
          {ingress.getPorts()}
        </DrawerItem>
        {spec.tls &&
        <DrawerItem name="TLS">
          {spec.tls.map((tls, index) => <p key={index}>{tls.secretName}</p>)}
        </DrawerItem>
        }
        {serviceName && servicePort &&
        <DrawerItem name="Service">
          {serviceName}:{servicePort}
        </DrawerItem>
        }
        <DrawerTitle title="Rules"/>
        {this.renderPaths(ingress)}

        <DrawerTitle title="Load-Balancer Ingress Points"/>
        {this.renderIngressPoints(ingressPoints)}
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Ingress",
  apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
  components: {
    Details: (props) => <IngressDetails {...props} />
  }
});
kubeObjectDetailRegistry.add({
  kind: "Ingress",
  apiVersions: ["networking.k8s.io/v1", "extensions/v1beta1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
