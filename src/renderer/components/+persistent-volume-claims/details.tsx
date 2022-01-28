/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { Fragment, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import type { PodStore } from "../+pods/store";
import { Link } from "react-router-dom";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./disk-chart";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForPvc, IPvcMetrics, PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { KubeObjectMeta } from "../kube-object-meta";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import podStoreInjectable from "../+pods/store.injectable";
import isMetricHiddenInjectable from "../../utils/is-metrics-hidden.injectable";

export interface PersistentVolumeClaimDetailsProps extends KubeObjectDetailsProps<PersistentVolumeClaim> {
}

interface Dependencies {
  podStore: PodStore;
  isMetricHidden: boolean;
}

const NonInjectedPersistentVolumeClaimDetails = observer(({ isMetricHidden, podStore, object: persistentVolumeClaim }: Dependencies & PersistentVolumeClaimDetailsProps) => {
  const [metrics, setMetrics] = useState<IPvcMetrics | null>(null);

  useEffect(() => setMetrics(null), [persistentVolumeClaim]);

  const loadMetrics = async () => {
    setMetrics(await getMetricsForPvc(persistentVolumeClaim));
  };

  if (!persistentVolumeClaim) {
    return null;
  }

  if (!(persistentVolumeClaim instanceof PersistentVolumeClaim)) {
    logger.error("[PersistentVolumeClaimDetails]: passed object that is not an instanceof PersistentVolumeClaim", persistentVolumeClaim);

    return null;
  }

  const { storageClassName, accessModes } = persistentVolumeClaim.spec;
  const pods = persistentVolumeClaim.getPods(podStore.items);

  return (
    <div className="PersistentVolumeClaimDetails">
      {!isMetricHidden && (
        <ResourceMetrics
          loader={loadMetrics}
          tabs={[
            "Disk",
          ]}
          object={persistentVolumeClaim}
          metrics={metrics}
        >
          <VolumeClaimDiskChart/>
        </ResourceMetrics>
      )}
      <KubeObjectMeta object={persistentVolumeClaim}/>
      <DrawerItem name="Access Modes">
        {accessModes.join(", ")}
      </DrawerItem>
      <DrawerItem name="Storage Class Name">
        {storageClassName}
      </DrawerItem>
      <DrawerItem name="Storage">
        {persistentVolumeClaim.getStorage()}
      </DrawerItem>
      <DrawerItem name="Pods" className="pods">
        {pods.map(pod => (
          <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
            {pod.getName()}
          </Link>
        ))}
      </DrawerItem>
      <DrawerItem name="Status">
        {persistentVolumeClaim.getStatus()}
      </DrawerItem>

      <DrawerTitle title="Selector"/>

      <DrawerItem name="Match Labels" labelsOnly>
        {persistentVolumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
      </DrawerItem>

      <DrawerItem name="Match Expressions">
        {persistentVolumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
          <Fragment key={i}>
            <DrawerItem name="Key">{key}</DrawerItem>
            <DrawerItem name="Operator">{operator}</DrawerItem>
            <DrawerItem name="Values">{values.join(", ")}</DrawerItem>
          </Fragment>
        ))}
      </DrawerItem>
    </div>
  );
});

export const PersistentVolumeClaimDetails = withInjectables<Dependencies, PersistentVolumeClaimDetailsProps>(NonInjectedPersistentVolumeClaimDetails, {
  getProps: (di, props) => ({
    podStore: di.inject(podStoreInjectable),
    isMetricHidden: di.inject(isMetricHiddenInjectable, {
      metricType: ClusterMetricsResourceType.VolumeClaim,
    }),
    ...props,
  }),
});
