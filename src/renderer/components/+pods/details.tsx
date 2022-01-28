/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { IPodMetrics, Pod, getMetricsForPods, NodeApi, PersistentVolumeClaimApi, ConfigMapApi } from "../../../common/k8s-api/endpoints";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { cssNames, toJS } from "../../utils";
import { PodDetailsContainer } from "./details-container";
import { PodDetailsAffinities } from "./details-affinities";
import { PodDetailsTolerations } from "./details-tolerations";
import { Icon } from "../icon";
import { PodDetailsSecrets } from "./details-secrets";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getItemMetrics } from "../../../common/k8s-api/endpoints/metrics.api";
import { PodCharts, podMetricTabs } from "./charts";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import persistentVolumeClaimApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import configMapApiInjectable from "../../../common/k8s-api/endpoints/configmap.api.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";

export interface PodDetailsProps extends KubeObjectDetailsProps<Pod> {
}

interface Dependencies {
  nodeApi: NodeApi;
  persistentVolumeClaimApi: PersistentVolumeClaimApi;
  configMapApi: ConfigMapApi;
  isMetricHidden: boolean;
}

const NonInjectedPodDetails = observer(({ isMetricHidden, nodeApi, persistentVolumeClaimApi, configMapApi, object: pod }: Dependencies & PodDetailsProps) => {
  const [metrics, setMetrics] = useState<IPodMetrics | null>(null);
  const [containerMetrics, setContainerMetrics] = useState<IPodMetrics | null>(null);

  useEffect(() => {
    setMetrics(null);
    setContainerMetrics(null);
  }, [pod]);

  if (!pod) {
    return null;
  }

  if (!(pod instanceof Pod)) {
    logger.error("[PodDetails]: passed object that is not an instanceof Pod", pod);

    return null;
  }

  const loadMetrics = async () => {
    setMetrics(await getMetricsForPods([pod], pod.getNs()));
    setContainerMetrics(await getMetricsForPods([pod], pod.getNs(), "container, namespace"));
  };
  const { status, spec } = pod;
  const { conditions, podIP } = status;
  const podIPs = pod.getIPs();
  const { nodeName } = spec;
  const nodeSelector = pod.getNodeSelectors();
  const volumes = pod.getVolumes();
  const initContainers = pod.getInitContainers();

  return (
    <div className="PodDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={podMetricTabs}
          object={pod}
          metrics={metrics}
        >
          <PodCharts/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={pod}/>
      <DrawerItem name="Status">
        <span className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</span>
      </DrawerItem>
      <DrawerItem name="Node">
        {nodeName && (
          <Link to={getDetailsUrl(nodeApi.getUrl({ name: nodeName }))}>
            {nodeName}
          </Link>
        )}
      </DrawerItem>
      <DrawerItem name="Pod IP">
        {podIP}
      </DrawerItem>
      <DrawerItem name="Pod IPs" hidden={!podIPs.length} labelsOnly>
        {
          podIPs.map(label => (
            <Badge key={label} label={label}/>
          ))
        }
      </DrawerItem>
      <DrawerItem name="Priority Class">
        {pod.getPriorityClassName()}
      </DrawerItem>
      <DrawerItem name="QoS Class">
        {pod.getQosClass()}
      </DrawerItem>
      {conditions &&
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {conditions.map(({ type, status, lastTransitionTime }) => (
            <Badge
              key={type}
              label={type}
              disabled={status === "False"}
              tooltip={`Last transition time: ${lastTransitionTime}`}
            />
          ))}
        </DrawerItem>
      }
      {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector">
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
      }
      <PodDetailsTolerations workload={pod}/>
      <PodDetailsAffinities workload={pod}/>

      {pod.getSecrets().length > 0 && (
        <DrawerItem name="Secrets">
          <PodDetailsSecrets pod={pod}/>
        </DrawerItem>
      )}

      {initContainers.length > 0 && (
        <>
          <DrawerTitle title="Init Containers"/>
          {initContainers.map(container => (
            <PodDetailsContainer
              key={container.name}
              pod={pod}
              container={container}
            />
          ))}
        </>
      )}

      <DrawerTitle title="Containers"/>
      {
        pod.getContainers().map(container => (
          <PodDetailsContainer
            key={container.name}
            pod={pod}
            container={container}
            metrics={getItemMetrics(toJS(containerMetrics), container.name)}
          />
        ))
      }

      {volumes.length > 0 && (
        <>
          <DrawerTitle title="Volumes"/>
          {volumes.map(volume => {
            const claimName = volume.persistentVolumeClaim ? volume.persistentVolumeClaim.claimName : null;
            const configMap = volume.configMap ? volume.configMap.name : null;
            const type = Object.keys(volume)[1];

            return (
              <div key={volume.name} className="volume">
                <div className="title flex gaps">
                  <Icon small material="storage"/>
                  <span>{volume.name}</span>
                </div>
                <DrawerItem name="Type">
                  {type}
                </DrawerItem>
                { type == "configMap" && (
                  <div>
                    {configMap && (
                      <DrawerItem name="Name">
                        <Link
                          to={getDetailsUrl(configMapApi.getUrl({
                            name: configMap,
                            namespace: pod.getNs(),
                          }))}>{configMap}
                        </Link>
                      </DrawerItem>
                    )}
                  </div>
                )}
                { type === "emptyDir" && (
                  <div>
                    { volume.emptyDir.medium && (
                      <DrawerItem name="Medium">
                        {volume.emptyDir.medium}
                      </DrawerItem>
                    )}
                    { volume.emptyDir.sizeLimit && (
                      <DrawerItem name="Size Limit">
                        {volume.emptyDir.sizeLimit}
                      </DrawerItem>
                    )}
                  </div>
                )}

                {claimName && (
                  <DrawerItem name="Claim Name">
                    <Link
                      to={getDetailsUrl(persistentVolumeClaimApi.getUrl({
                        name: claimName,
                        namespace: pod.getNs(),
                      }))}
                    >{claimName}
                    </Link>
                  </DrawerItem>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
});

export const PodDetails = withInjectables<Dependencies, PodDetailsProps>(NonInjectedPodDetails, {
  getProps: (di, props) => ({
    nodeApi: di.inject(nodeApiInjectable),
    persistentVolumeClaimApi: di.inject(persistentVolumeClaimApiInjectable),
    configMapApi: di.inject(configMapApiInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.Pod,
    }),
    ...props,
  }),
});
