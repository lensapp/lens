/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./service-details.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Service } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import { ServiceDetailsEndpoint } from "./service-details-endpoint";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import endpointStoreInjectable from "../+endpoints/store.injectable";
import { Disposer, disposer } from "../../utils";
import type { EndpointStore } from "../+endpoints/store";
import { ContainerPort } from "../container-port/view";
import watchPortForwardsInjectable from "../../port-forward/watch-port-forwards.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface ServiceDetailsProps extends KubeObjectDetailsProps<Service> {
}

interface Dependencies {
  endpointStore: EndpointStore;
  watchPortForwards: () => Disposer;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedServiceDetails = observer(({ kubeWatchApi, object: service, endpointStore, watchPortForwards }: Dependencies & ServiceDetailsProps) => {
  useEffect(() => disposer(
    kubeWatchApi.subscribeStores([
      endpointStore,
    ], {
      namespaces: [service.getNs()],
    }),
    watchPortForwards(),
  ), []);

  if (!service) {
    return null;
  }

  if (!(service instanceof Service)) {
    logger.error("[ServiceDetails]: passed object that is not an instanceof Service", service);

    return null;
  }

  const { spec } = service;
  const endpoint = endpointStore.getByName(service.getName(), service.getNs());
  const externalIps = service.getExternalIps();

  if (externalIps.length === 0 && spec?.externalName) {
    externalIps.push(spec.externalName);
  }

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

      <DrawerTitle title="Connection"/>

      <DrawerItem name="Cluster IP">
        {spec.clusterIP}
      </DrawerItem>

      <DrawerItem name="Cluster IPs" hidden={!service.getClusterIps().length} labelsOnly>
        {
          service.getClusterIps().map(label => (
            <Badge key={label} label={label}/>
          ))
        }
      </DrawerItem>

      <DrawerItem name="IP families" hidden={!service.getIpFamilies().length}>
        {service.getIpFamilies().join(", ")}
      </DrawerItem>

      <DrawerItem name="IP family policy" hidden={!service.getIpFamilyPolicy()}>
        {service.getIpFamilyPolicy()}
      </DrawerItem>

      {externalIps.length > 0 && (
        <DrawerItem name="External IPs">
          {externalIps.map(ip => <div key={ip}>{ip}</div>)}
        </DrawerItem>
      )}

      <DrawerItem name="Ports">
        <div>
          {
            service.getPorts().map((port) => (
              <ContainerPort
                object={service}
                port={{
                  port: port.port,
                  protocol: port.protocol,
                  name: port.name,
                }}
                key={port.toString()}
              />
            ))
          }
        </div>
      </DrawerItem>

      {spec.type === "LoadBalancer" && spec.loadBalancerIP && (
        <DrawerItem name="Load Balancer IP">
          {spec.loadBalancerIP}
        </DrawerItem>
      )}
      <DrawerTitle title="Endpoint"/>

      <ServiceDetailsEndpoint endpoint={endpoint}/>
    </div>
  );
});

export const ServiceDetails = withInjectables<Dependencies, ServiceDetailsProps>(NonInjectedServiceDetails, {
  getProps: (di, props) => ({
    endpointStore: di.inject(endpointStoreInjectable),
    watchPortForwards: di.inject(watchPortForwardsInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});

