/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect } from "react";
import startCase from "lodash/startCase";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { observer } from "mobx-react";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { StorageClass } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import type { StorageClassStore } from "./store";
import { PersistentVolumeDetailsList } from "../+persistent-volumes/details-list";
import type { PersistentVolumeStore } from "../+persistent-volumes/store";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import storageClassStoreInjectable from "./store.injectable";
import persistentVolumeStoreInjectable from "../+persistent-volumes/store.injectable";
import type { KubeWatchApi } from "../../kube-watch-api/kube-watch-api";
import kubeWatchApiInjectable from "../../kube-watch-api/kube-watch-api.injectable";

export interface StorageClassDetailsProps extends KubeObjectDetailsProps<StorageClass> {
}

interface Dependencies {
  storageClassStore: StorageClassStore;
  persistentVolumeStore: PersistentVolumeStore;
  kubeWatchApi: KubeWatchApi;
}

const NonInjectedStorageClassDetails = observer(({ kubeWatchApi, storageClassStore, persistentVolumeStore, object: storageClass }: Dependencies & StorageClassDetailsProps) => {
  useEffect(() => (
    kubeWatchApi.subscribeStores([
      persistentVolumeStore,
    ])
  ), []);

  if (!storageClass) {
    return null;
  }

  if (!(storageClass instanceof StorageClass)) {
    logger.error("[StorageClassDetails]: passed object that is not an instanceof StorageClass", storageClass);

    return null;
  }

  const persistentVolumes = storageClassStore.getPersistentVolumes(storageClass);
  const { provisioner, parameters, mountOptions } = storageClass;

  return (
    <div className="StorageClassDetails">
      <KubeObjectMeta object={storageClass}/>

      {provisioner && (
        <DrawerItem name="Provisioner" labelsOnly>
          <Badge label={provisioner}/>
        </DrawerItem>
      )}
      <DrawerItem name="Volume Binding Mode">
        {storageClass.getVolumeBindingMode()}
      </DrawerItem>
      <DrawerItem name="Reclaim Policy">
        {storageClass.getReclaimPolicy()}
      </DrawerItem>

      {mountOptions && (
        <DrawerItem name="Mount Options">
          {mountOptions.join(", ")}
        </DrawerItem>
      )}
      {parameters && (
        <>
          <DrawerTitle title="Parameters"/>
          {
            Object.entries(parameters).map(([name, value]) => (
              <DrawerItem key={name + value} name={startCase(name)}>
                {value}
              </DrawerItem>
            ))
          }
        </>
      )}
      <PersistentVolumeDetailsList
        persistentVolumes={persistentVolumes}
        isLoaded={persistentVolumeStore.isLoaded}
      />
    </div>
  );
});

export const StorageClassDetails = withInjectables<Dependencies, StorageClassDetailsProps>(NonInjectedStorageClassDetails, {
  getProps: (di, props) => ({
    storageClassStore: di.inject(storageClassStoreInjectable),
    persistentVolumeStore: di.inject(persistentVolumeStoreInjectable),
    kubeWatchApi: di.inject(kubeWatchApiInjectable),
    ...props,
  }),
});

