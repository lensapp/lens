/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Pod, PodSpecVolume, PodVolumeKind } from "../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../drawer";
import { Icon } from "../../../icon";
import { AwsElasticBlockStore } from "./variants/aws-elastic-block-store";
import { AzureDisk } from "./variants/azure-disk";
import { AzureFile } from "./variants/azure-file";
import { CephFs } from "./variants/ceph-fs";
import { Cinder } from "./variants/cinder";
import { ConfigMap } from "./variants/config-map";
import { ContainerStorageInterface } from "./variants/container-storage-interface";
import { DownwardAPI } from "./variants/downward-api";
import { EmptyDir } from "./variants/empty-dir";
import { Ephemeral } from "./variants/ephemeral";
import { FiberChannel } from "./variants/fiber-channel";
import { FlexVolume } from "./variants/flex-volume";
import { Flocker } from "./variants/flocker";
import { GcePersistentDisk } from "./variants/gce-persistent-disk";
import { GitRepo } from "./variants/git-repo";
import { GlusterFs } from "./variants/gluster-fs";
import { HostPath } from "./variants/host-path";
import { IScsi } from "./variants/i-scsi";
import { Local } from "./variants/local";
import { NetworkFs } from "./variants/network-fs";
import { PersistentVolumeClaim } from "./variants/persistent-volume-claim";
import { PhotonPersistentDisk } from "./variants/photon-persistent-disk";
import { PortworxVolume } from "./variants/portworx-volume";
import { Projected } from "./variants/projected";
import { Quobyte } from "./variants/quobyte";
import { RadosBlockDevice } from "./variants/rados-block-device";
import { ScaleIo } from "./variants/scale-io";
import { Secret } from "./variants/secret";
import { StorageOs } from "./variants/storage-os";
import { VsphereVolume } from "./variants/vsphere-volume";

const deprecatedVolumeTypes = new Set<PodVolumeKind>([
  "flocker",
  "gitRepo",
  "quobyte",
  "storageos",
]);

interface VolumeVariantProps {
  pod: Pod;
  volume: PodSpecVolume;
}

interface VolumeVariantRender {
  kind: PodVolumeKind;
  element: JSX.Element;
}

function renderVolumeVariant({ pod, volume }: VolumeVariantProps): VolumeVariantRender | null {
  if (volume.awsElasticBlockStore) {
    return {
      kind: "awsElasticBlockStore",
      element: <AwsElasticBlockStore
        variant={volume.awsElasticBlockStore}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.azureDisk) {
    return {
      kind: "azureDisk",
      element: <AzureDisk
        variant={volume.azureDisk}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.azureFile) {
    return {
      kind: "azureFile",
      element: <AzureFile
        variant={volume.azureFile}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.cephfs) {
    return {
      kind: "cephfs",
      element: <CephFs
        variant={volume.cephfs}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.cinder) {
    return {
      kind: "cinder",
      element: <Cinder
        variant={volume.cinder}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.configMap) {
    return {
      kind: "configMap",
      element: <ConfigMap
        variant={volume.configMap}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.csi) {
    return {
      kind: "csi",
      element: <ContainerStorageInterface
        variant={volume.csi}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.downwardAPI) {
    return {
      kind: "downwardAPI",
      element: <DownwardAPI
        variant={volume.downwardAPI}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.emptyDir) {
    return {
      kind: "emptyDir",
      element: <EmptyDir
        variant={volume.emptyDir}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.ephemeral) {
    return {
      kind: "ephemeral",
      element: <Ephemeral
        variant={volume.ephemeral}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.fc) {
    return {
      kind: "fc",
      element: <FiberChannel
        variant={volume.fc}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.flexVolume) {
    return {
      kind: "flexVolume",
      element: <FlexVolume
        variant={volume.flexVolume}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.flocker) {
    return {
      kind: "flocker",
      element: <Flocker
        variant={volume.flocker}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.gcePersistentDisk) {
    return {
      kind: "gcePersistentDisk",
      element: <GcePersistentDisk
        variant={volume.gcePersistentDisk}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.gitRepo) {
    return {
      kind: "gitRepo",
      element: <GitRepo
        variant={volume.gitRepo}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.glusterfs) {
    return {
      kind: "glusterfs",
      element: <GlusterFs
        variant={volume.glusterfs}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.hostPath) {
    return {
      kind: "hostPath",
      element: <HostPath
        variant={volume.hostPath}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.iscsi) {
    return {
      kind: "iscsi",
      element: <IScsi
        variant={volume.iscsi}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.local) {
    return {
      kind: "local",
      element: <Local
        variant={volume.local}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.nfs) {
    return {
      kind: "nfs",
      element: <NetworkFs
        variant={volume.nfs}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.persistentVolumeClaim) {
    return {
      kind: "persistentVolumeClaim",
      element: <PersistentVolumeClaim
        variant={volume.persistentVolumeClaim}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.photonPersistentDisk) {
    return {
      kind: "photonPersistentDisk",
      element: <PhotonPersistentDisk
        variant={volume.photonPersistentDisk}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.portworxVolume) {
    return {
      kind: "portworxVolume",
      element: <PortworxVolume
        variant={volume.portworxVolume}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.projected) {
    return {
      kind: "projected",
      element: <Projected
        variant={volume.projected}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.quobyte) {
    return {
      kind: "quobyte",
      element: <Quobyte
        variant={volume.quobyte}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.rbd) {
    return {
      kind: "rbd",
      element: <RadosBlockDevice
        variant={volume.rbd}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.scaleIO) {
    return {
      kind: "scaleIO",
      element: <ScaleIo
        variant={volume.scaleIO}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.secret) {
    return {
      kind: "secret",
      element: <Secret
        variant={volume.secret}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.storageos) {
    return {
      kind: "storageos",
      element: <StorageOs
        variant={volume.storageos}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  if (volume.vsphereVolume) {
    return {
      kind: "vsphereVolume",
      element: <VsphereVolume
        variant={volume.vsphereVolume}
        pod={pod}
        volumeName={volume.name}
      />,
    };
  }

  return null;
}

export function VolumeVariant(props: VolumeVariantProps) {
  const result = renderVolumeVariant(props);

  if (!result) {
    return <p>Error! Unknown pod volume kind</p>;
  }

  const { kind, element } = result;
  const isDeprecated = deprecatedVolumeTypes.has(kind);

  return (
    <>
      <DrawerItem name="Kind">
        {kind}
        {isDeprecated && <Icon title="Deprecated" material="warning_amber" />}
      </DrawerItem>
      {element}
    </>
  );
}
