/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-claim-details.scss";

import React, { Fragment } from "react";
import { makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { podsStore } from "../+workloads-pods/pods.store";
import { Link } from "react-router-dom";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForPvc, type PersistentVolumeClaimMetricData, PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { KubeObjectMeta } from "../kube-object-meta";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";

export interface PersistentVolumeClaimDetailsProps extends KubeObjectDetailsProps<PersistentVolumeClaim> {
}

@observer
export class PersistentVolumeClaimDetails extends React.Component<PersistentVolumeClaimDetailsProps> {
  @observable metrics: PersistentVolumeClaimMetricData | null = null;

  constructor(props: PersistentVolumeClaimDetailsProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
    ]);
  }

  loadMetrics = async () => {
    const { object: volumeClaim } = this.props;

    this.metrics = await getMetricsForPvc(volumeClaim);
  };

  render() {
    const { object: volumeClaim } = this.props;

    if (!volumeClaim) {
      return null;
    }

    if (!(volumeClaim instanceof PersistentVolumeClaim)) {
      logger.error("[PersistentVolumeClaimDetails]: passed object that is not an instanceof PersistentVolumeClaim", volumeClaim);

      return null;
    }

    const { storageClassName, accessModes } = volumeClaim.spec;
    const pods = volumeClaim.getPods(podsStore.items);
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.VolumeClaim);

    return (
      <div className="PersistentVolumeClaimDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={[
              "Disk",
            ]}
            object={volumeClaim}
            metrics={this.metrics}
          >
            <VolumeClaimDiskChart/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={volumeClaim}/>
        <DrawerItem name="Access Modes">
          {accessModes?.join(", ")}
        </DrawerItem>
        <DrawerItem name="Storage Class Name">
          {storageClassName}
        </DrawerItem>
        <DrawerItem name="Storage">
          {volumeClaim.getStorage()}
        </DrawerItem>
        <DrawerItem name="Pods" className="pods">
          {pods.map(pod => (
            <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
              {pod.getName()}
            </Link>
          ))}
        </DrawerItem>
        <DrawerItem name="Status">
          {volumeClaim.getStatus()}
        </DrawerItem>

        <DrawerTitle>Selector</DrawerTitle>

        <DrawerItem name="Match Labels" labelsOnly>
          {volumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>

        <DrawerItem name="Match Expressions">
          {volumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
            <Fragment key={i}>
              <DrawerItem name="Key">{key}</DrawerItem>
              <DrawerItem name="Operator">{operator}</DrawerItem>
              <DrawerItem name="Values">{values?.join(", ")}</DrawerItem>
            </Fragment>
          ))}
        </DrawerItem>
      </div>
    );
  }
}
