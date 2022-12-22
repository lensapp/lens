/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import startCase from "lodash/startCase";
import "./volume-details.scss";

import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { PersistentVolume, persistentVolumeClaimApi, storageClassApi } from "../../../common/k8s-api/endpoints";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getDetailsUrl } from "../kube-detail-params";
import type { Logger } from "../../../common/logger";
import { stopPropagation } from "../../../renderer/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

export interface PersistentVolumeDetailsProps extends KubeObjectDetailsProps<PersistentVolume> {
}

interface Dependencies {
  logger: Logger;
}

@observer
class NonInjectedPersistentVolumeDetails extends React.Component<PersistentVolumeDetailsProps & Dependencies> {
  render() {
    const { object: volume } = this.props;

    if (!volume) {
      return null;
    }

    if (!(volume instanceof PersistentVolume)) {
      this.props.logger.error("[PersistentVolumeDetails]: passed object that is not an instanceof PersistentVolume", volume);

      return null;
    }

    const { accessModes, capacity, persistentVolumeReclaimPolicy, storageClassName, claimRef, flexVolume, mountOptions, nfs } = volume.spec;

    const storageClassDetailsUrl = getDetailsUrl(storageClassApi.getUrl({
      name: storageClassName,
    }));

    return (
      <div className="PersistentVolumeDetails">
        <DrawerItem name="Capacity">
          {capacity?.storage}
        </DrawerItem>

        {mountOptions && (
          <DrawerItem name="Mount Options">
            {mountOptions.join(", ")}
          </DrawerItem>
        )}

        <DrawerItem name="Access Modes">
          {accessModes?.join(", ")}
        </DrawerItem>
        <DrawerItem name="Reclaim Policy">
          {persistentVolumeReclaimPolicy}
        </DrawerItem>
        <DrawerItem name="Storage Class Name">
          <Link
            key="link"
            to={storageClassDetailsUrl}
            onClick={stopPropagation}
          >
            {storageClassName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Status" labelsOnly>
          <Badge label={volume.getStatus()} />
        </DrawerItem>

        {nfs && (
          <>
            <DrawerTitle>Network File System</DrawerTitle>
            {
              Object.entries(nfs).map(([name, value]) => (
                <DrawerItem key={name} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}

        {flexVolume && (
          <>
            <DrawerTitle>FlexVolume</DrawerTitle>
            <DrawerItem name="Driver">
              {flexVolume.driver}
            </DrawerItem>
            {
              Object.entries(flexVolume.options ?? {}).map(([name, value]) => (
                <DrawerItem key={name} name={startCase(name)}>
                  {value}
                </DrawerItem>
              ))
            }
          </>
        )}

        {claimRef && (
          <>
            <DrawerTitle>Claim</DrawerTitle>
            <DrawerItem name="Type">
              {claimRef.kind}
            </DrawerItem>
            <DrawerItem name="Name">
              <Link to={getDetailsUrl(persistentVolumeClaimApi.getUrl(claimRef))}>
                {claimRef.name}
              </Link>
            </DrawerItem>
            <DrawerItem name="Namespace">
              {claimRef.namespace}
            </DrawerItem>
          </>
        )}
      </div>
    );
  }
}

export const PersistentVolumeDetails = withInjectables<Dependencies, PersistentVolumeDetailsProps>(NonInjectedPersistentVolumeDetails, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});
