/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Pod } from "@k8slens/kube-object";
import type { NodeApi, PriorityClassApi, RuntimeClassApi, ServiceAccountApi } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { cssNames, stopPropagation } from "@k8slens/utilities";
import { PodDetailsAffinities } from "./pod-details-affinities";
import { PodDetailsTolerations } from "./pod-details-tolerations";
import { PodDetailsSecrets } from "./pod-details-secrets";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { Logger } from "../../../common/logger";
import { PodVolumes } from "./details/volumes/view";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import runtimeClassApiInjectable from "../../../common/k8s-api/endpoints/runtime-class.api.injectable";
import serviceAccountApiInjectable from "../../../common/k8s-api/endpoints/service-account.api.injectable";
import priorityClassApiInjectable from "../../../common/k8s-api/endpoints/priority-class.api.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import { PodDetailsContainers } from "./details/containers/pod-details-containers";
import { PodDetailsInitContainers } from "./details/containers/pod-details-init-containers";

export interface PodDetailsProps extends KubeObjectDetailsProps<Pod> {
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  nodeApi: NodeApi;
  priorityClassApi: PriorityClassApi;
  runtimeClassApi: RuntimeClassApi;
  serviceAccountApi: ServiceAccountApi;
  logger: Logger;
}

@observer
class NonInjectedPodDetails extends React.Component<PodDetailsProps & Dependencies> {
  render() {
    const { object: pod, getDetailsUrl, nodeApi, logger } = this.props;

    if (!pod) {
      return null;
    }

    if (!(pod instanceof Pod)) {
      logger.error("[PodDetails]: passed object that is not an instanceof Pod", pod);

      return null;
    }

    const { status, spec } = pod;
    const { conditions = [], podIP } = status ?? {};
    const podIPs = pod.getIPs();
    const { nodeName } = spec ?? {};
    const nodeSelector = pod.getNodeSelectors();

    const namespace = pod.getNs();
    const priorityClassName = pod.getPriorityClassName();
    const runtimeClassName = pod.getRuntimeClassName();
    const serviceAccountName = pod.getServiceAccountName();

    const priorityClassDetailsUrl = getDetailsUrl(this.props.priorityClassApi.formatUrlForNotListing({
      name: priorityClassName,
    }));
    const runtimeClassDetailsUrl = getDetailsUrl(this.props.runtimeClassApi.formatUrlForNotListing({
      name: runtimeClassName,
    }));
    const serviceAccountDetailsUrl = getDetailsUrl(this.props.serviceAccountApi.formatUrlForNotListing({
      name: serviceAccountName,
      namespace,
    }));

    return (
      <div className="PodDetails">
        <DrawerItem name="Status">
          <span className={cssNames("status", kebabCase(pod.getStatusMessage()))}>
            {pod.getStatusMessage()}
          </span>
        </DrawerItem>
        <DrawerItem name="Node" hidden={!nodeName}>
          <Link to={getDetailsUrl(nodeApi.formatUrlForNotListing({ name: nodeName }))}>
            {nodeName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Pod IP">
          {podIP}
        </DrawerItem>
        <DrawerItem
          name="Pod IPs"
          hidden={podIPs.length === 0}
          labelsOnly
        >
          {podIPs.map(label => <Badge key={label} label={label} />)}
        </DrawerItem>
        <DrawerItem name="Service Account">
          <Link
            key="link"
            to={serviceAccountDetailsUrl}
            onClick={stopPropagation}
          >
            {serviceAccountName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Priority Class" hidden={priorityClassName === ""}>
          <Link
            key="link"
            to={priorityClassDetailsUrl}
            onClick={stopPropagation}
          >
            {priorityClassName}
          </Link>
        </DrawerItem>
        <DrawerItem name="QoS Class">
          {pod.getQosClass()}
        </DrawerItem>
        <DrawerItem name="Runtime Class" hidden={runtimeClassName === ""}>
          <Link
            key="link"
            to={runtimeClassDetailsUrl}
            onClick={stopPropagation}
          >
            {runtimeClassName}
          </Link>
        </DrawerItem>

        <DrawerItem
          name="Conditions"
          className="conditions"
          hidden={conditions.length === 0}
          labelsOnly
        >
          {
            conditions.map(({ type, status, lastTransitionTime }) => (
              <Badge
                key={type}
                label={type}
                disabled={status === "False"}
                tooltip={`Last transition time: ${lastTransitionTime ?? "<unknown>"}`}
              />
            ))
          }
        </DrawerItem>

        <DrawerItem name="Node Selector" hidden={nodeSelector.length === 0}>
          {nodeSelector.map(label => <Badge key={label} label={label} />)}
        </DrawerItem>

        <PodDetailsTolerations workload={pod} />
        <PodDetailsAffinities workload={pod} />

        <DrawerItem name="Secrets" hidden={pod.getSecrets().length === 0}>
          <PodDetailsSecrets pod={pod} />
        </DrawerItem>

        <PodDetailsInitContainers pod={pod} />

        <PodDetailsContainers pod={pod} />

        <PodVolumes pod={pod} />
      </div>
    );
  }
}

export const PodDetails = withInjectables<Dependencies, PodDetailsProps>(NonInjectedPodDetails, {
  getProps: (di, props) => ({
    ...props,
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    nodeApi: di.inject(nodeApiInjectable),
    priorityClassApi: di.inject(priorityClassApiInjectable),
    runtimeClassApi: di.inject(runtimeClassApiInjectable),
    serviceAccountApi: di.inject(serviceAccountApiInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
