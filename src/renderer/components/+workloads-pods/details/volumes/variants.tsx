/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { PodVolumeKind, PodVolumeVariants } from "../../../../../common/k8s-api/endpoints";
import type { VolumeVariantComponent } from "./variant-helpers";
import { AwsElasticBlockStore } from "./variants/aws-elastic-block-store";
import { AzureDisk } from "./variants/azure-disk";
import { AzureFile } from "./variants/azure-file";
import { CephFs } from "./variants/ceph-fs";
import { Cinder } from "./variants/cinder";
import { ConfigMap } from "./variants/config-map";
import { ContainerStorageInterface } from "./variants/container-storage-interface";
import { DownwardApi } from "./variants/downward-api";
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

const variantComponents = new Map<PodVolumeKind, VolumeVariantComponent<keyof PodVolumeVariants>>([
  ["awsElasticBlockStore", AwsElasticBlockStore],
  ["azureDisk", AzureDisk],
  ["azureFile", AzureFile],
  ["cephfs", CephFs],
  ["cinder", Cinder],
  ["configMap", ConfigMap],
  ["csi", ContainerStorageInterface],
  ["downwardAPI", DownwardApi],
  ["emptyDir", EmptyDir],
  ["ephemeral", Ephemeral],
  ["fc", FiberChannel],
  ["flexVolume", FlexVolume],
  ["flocker", Flocker],
  ["gcePersistentDisk", GcePersistentDisk],
  ["gitRepo", GitRepo],
  ["glusterfs", GlusterFs],
  ["hostPath", HostPath],
  ["iscsi", IScsi],
  ["local", Local],
  ["nfs", NetworkFs],
  ["persistentVolumeClaim", PersistentVolumeClaim],
  ["photonPersistentDisk", PhotonPersistentDisk],
  ["portworxVolume", PortworxVolume],
  ["projected", Projected],
  ["quobyte", Quobyte],
  ["rbd", RadosBlockDevice],
  ["scaleIO", ScaleIo],
  ["secret", Secret],
  ["storageos", StorageOs],
  ["vsphereVolume", VsphereVolume],
]);


export default function getVolumeVariantComponent(kind: PodVolumeKind) {
  const NotSupported: VolumeVariantComponent<keyof PodVolumeVariants> = (
    () => <p>Variant {kind} is not yet supported</p>
  );

  return variantComponents.get(kind) ?? NotSupported;
}
