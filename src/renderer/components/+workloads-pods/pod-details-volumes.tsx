/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import jsyaml from "js-yaml";
import { observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";
import { configMapApi, Pod, PodVolume, PodVolumeKind, PodVolumeVariants, pvcApi, SecretReference, secretsApi } from "../../../common/k8s-api/endpoints";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import type { KubeObject, LocalObjectReference } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerItemLabels, DrawerSection, DrawerSubSection } from "../drawer";
import { Icon } from "../icon";
import { getDetailsUrl } from "../kube-detail-params";

/**
 * Additional parameters for each volume variant
 */
export interface VariantOptions {
  pod: Pod;
  volumeName: string;
}

function renderLocalRef(pod: Pod, title: string, ref: LocalObjectReference | SecretReference, typeApi: KubeApi<KubeObject>) {
  return (
    <DrawerItem name={title}>
      <Link to={getDetailsUrl(typeApi.getUrl({ namespace: pod.getNs(), ...ref }))}>
        {ref.name}
      </Link>
    </DrawerItem>
  );
}

/**
 *
 */
type PodVolumeVariantRenderers = {
  [Key in keyof PodVolumeVariants]: (variant: PodVolumeVariants[Key], opts: VariantOptions) => React.ReactNode;
};

const volumeRenderers: PodVolumeVariantRenderers = {
  awsElasticBlockStore: ({ volumeID, fsType = "ext4" }) => (
    <>
      <DrawerItem name="Volume ID">
        {volumeID}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
    </>
  ),
  azureDisk: ({ diskName, diskURI, kind = "Shared", cachingMode = "None", fsType = "ext4", readonly = false }) => (
    <>
      <DrawerItem name={kind === "Managed" ? "Disk Name" : "VHD blob Name"}>
        {diskName}
      </DrawerItem>
      <DrawerItem name={kind === "Managed" ? "Resource ID" : "Disk URI"}>
        {diskURI}
      </DrawerItem>
      <DrawerItem name="Kind">
        {kind}
      </DrawerItem>
      <DrawerItem name="Caching Mode">
        {cachingMode}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readonly.toString()}
      </DrawerItem>
    </>
  ),
  azureFile: ({ readOnly = false, secretName, shareName, secretNamespace = "default" }) => (
    <>
      <DrawerItem name="Secret Name">
        {secretName}
      </DrawerItem>
      <DrawerItem name="Share Name">
        {shareName}
      </DrawerItem>
      <DrawerItem name="Namespace of Secret">
        {secretNamespace}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  ephemeral: ({ volumeClaimTemplate: { metadata, spec }}, { pod, volumeName }) => (
    <>
      <DrawerItem name="PVC Template Name">
        {pod.getName()}-{volumeName}
      </DrawerItem>
      <DrawerItemLabels
        name="Template Labels"
        labels={metadata.labels}
      />
      <DrawerItemLabels
        name="Template Annotations"
        labels={metadata.annotations}
      />
      <DrawerItem name="Template PVC Spec">
        {jsyaml.dump(spec)}
      </DrawerItem>
    </>
  ),
  emptyDir: ({ medium, sizeLimit }) => (
    <>
      <DrawerItem name="Medium" hidden={!medium}>
        {medium}
      </DrawerItem>
      <DrawerItem name="Size Limit" hidden={!sizeLimit}>
        {sizeLimit}
      </DrawerItem>
    </>
  ),
  cephfs: ({ monitors, path = "/", user = "admin", secretFile = "/etc/ceph/user.secret", secretRef, readOnly }, { pod }) => (
    <>
      <DrawerItem name="Monitors">
        <ul>
          {monitors.map(monitor => <li key={monitor}>{monitor}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Mount Path">
        {path}
      </DrawerItem>
      <DrawerItem name="Username">
        {user}
      </DrawerItem>
      {
        secretRef
          ? renderLocalRef(pod, "Secret", secretRef, secretsApi)
          : (
            <DrawerItem name="Secret Filepath">
              {secretFile}
            </DrawerItem>
          )
      }
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  cinder: ({ volumeID, fsType = "ext4" }) => (
    <>
      <DrawerItem name="Volume ID">
        {volumeID}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
    </>
  ),
  configMap: ({ name }, { pod }) => renderLocalRef(pod, "Name", { name }, configMapApi),
  downwardAPI: ({ items }) => (
    <>
      <DrawerItem name="Items">
        <ul>
          {items.map(item => <li key={item.path}>{item.path}</li>)}
        </ul>
      </DrawerItem>
    </>
  ),
  fc: ({ targetWWNs, lun, fsType = "ext4", readOnly = false }) => (
    <>
      <DrawerItem name="Target World Wide Names">
        <ul>
          {targetWWNs.map(targetWWN => <li key={targetWWN}>{targetWWN}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Logical Unit Number">
        {lun.toString()}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  flexVolume: ({ driver, fsType, secretRef, readOnly = false, options }, { pod }) => (
    <>
      <DrawerItem name="Driver">
        {driver}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType || "-- system default --"}
      </DrawerItem>
      {secretRef && renderLocalRef(pod, "Secret", secretRef, secretsApi)}
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
        {
          ...Object.entries(options)
            .map(([key, value]) => (
              <DrawerItem key={key} name={`Option: ${key}`}>
                {value}
              </DrawerItem>
            ))
        }
    </>
  ),
  flocker: ({ datasetName }) => (
    <>
      <DrawerItem name="Dataset Name">
        {datasetName}
      </DrawerItem>
    </>
  ),
  gcePersistentDisk: ({ pdName, fsType = "ext4" }) => (
    <>
      <DrawerItem name="Persistent Disk Name">
        {pdName}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
    </>
  ),
  gitRepo: ({ repository, revision }) => (
    <>
      <DrawerItem name="Repository URL">
        {repository}
      </DrawerItem>
      <DrawerItem name="Commit Hash">
        {revision}
      </DrawerItem>
    </>
  ),
  glusterfs: ({ endpoints, path, readOnly = false }) => (
    <>
      <DrawerItem name="Endpoints object name">
        {endpoints}
      </DrawerItem>
      <DrawerItem name="Glusterfs volume name">
        {path}
      </DrawerItem>
      <DrawerItem name="Readonly Mountpoint">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  hostPath: ({ path, type }) => (
    <>
      <DrawerItem name="Node's Host Filesystem Path">
        {path}
      </DrawerItem>
      <DrawerItem name="Check Behaviour">
        {type || "-- none --"}
      </DrawerItem>
    </>
  ),
  iscsi: ({ targetPortal, iqn, lun, fsType = "ext4", readOnly = false, chapAuthDiscovery, chapAuthSession, secretRef }) => (
    <>
      <DrawerItem name="Target Address">
        {targetPortal}
      </DrawerItem>
      <DrawerItem name="iSCSI qualified name">
        {iqn}
      </DrawerItem>
      <DrawerItem name="Logical Unit Number">
        {lun.toString()}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      {chapAuthDiscovery && (
        <DrawerItem name="CHAP Discovery Authentication">
          {chapAuthDiscovery.toString()}
        </DrawerItem>
      )}
      {chapAuthSession && (
        <DrawerItem name="CHAP Session Authentication">
          {chapAuthSession.toString()}
        </DrawerItem>
      )}
      { secretRef && (
        <DrawerItem name="CHAP Secret">
          {secretRef.name}
        </DrawerItem>
      )}
    </>
  ),
  local: ({ path }) => (
    <>
      <DrawerItem name="Path">
        {path}
      </DrawerItem>
    </>
  ),
  nfs: ({ server, path, readOnly = false }) => (
    <>
      <DrawerItem name="Server">
        {server}
      </DrawerItem>
      <DrawerItem name="Path">
        {path}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  persistentVolumeClaim: ({ claimName }, { pod }) => renderLocalRef(pod, "Name", { name: claimName }, pvcApi),
  photonPersistentDisk: ({ pdID, fsType = "ext4" }) => (
    <>
      <DrawerItem name="Persistent Disk ID">
        {pdID}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
    </>
  ),
  portworxVolume: ({ volumeID, fsType = "ext4", readOnly = false }) => (
    <>
      <DrawerItem name="Volume ID">
        {volumeID}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  projected: ({ sources, defaultMode }) => (
    <>
      <DrawerItem name="Default Mount Mode">
          0o{defaultMode.toString(8)}
      </DrawerItem>
      <DrawerItem name="Sources">
        {
          sources.map(({ secret, downwardAPI, configMap, serviceAccountToken }, index) => (
            <React.Fragment key={index}>
              {secret && (
                <DrawerSubSection title="Secret">
                  <DrawerItem name="Name">
                    {secret.name}
                  </DrawerItem>
                  {secret.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {secret.items.map(({ key }) => <li key={key}>{key}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </DrawerSubSection>
              )}
              {downwardAPI && (
                <DrawerSubSection title="Downward API">
                  {downwardAPI.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {downwardAPI.items.map(({ path }) => <li key={path}>{path}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </DrawerSubSection>
              )}
              {configMap && (
                <DrawerSubSection title="Config Map">
                  <DrawerItem name="Name">
                    {configMap.name}
                  </DrawerItem>
                  {configMap.items && (
                    <DrawerItem name="Items">
                      <ul>
                        {configMap.items.map(({ path }) => <li key={path}>{path}</li>)}
                      </ul>
                    </DrawerItem>
                  )}
                </DrawerSubSection>
              )}
              {serviceAccountToken && (
                <DrawerSubSection title="Service Account Token">
                  <DrawerItem name="Audience" hidden={!serviceAccountToken.audience}>
                    {serviceAccountToken.audience}
                  </DrawerItem>
                  <DrawerItem name="Expiration" hidden={!serviceAccountToken.expirationSeconds}>
                    {serviceAccountToken.expirationSeconds}s
                  </DrawerItem>
                  <DrawerItem name="Path">
                    {serviceAccountToken.path}
                  </DrawerItem>
                </DrawerSubSection>
              )}
            </React.Fragment>
          ))
        }
      </DrawerItem>
    </>
  ),
  quobyte: ({ registry, volume, readOnly = false, user = "serviceaccount", group, tenant }) => (
    <>
      <DrawerItem name="Registry">
        {registry}
      </DrawerItem>
      <DrawerItem name="Volume">
        {volume}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      <DrawerItem name="User">
        {user}
      </DrawerItem>
      <DrawerItem name="Group">
        {group ?? "-- no group --"}
      </DrawerItem>
      <DrawerItem name="Tenant" hidden={!tenant}>
        {tenant}
      </DrawerItem>
    </>
  ),
  rbd: ({ monitors, image, fsType = "ext4", pool = "rbd", user = "admin", keyring = "/etc/ceph/keyright", secretRef, readOnly = false }, { pod }) => (
    <>
      <DrawerItem name="Ceph Monitors">
        <ul>
          {monitors.map(monitor => <li key={monitor}>{monitor}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Image">
        {image}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Pool">
        {pool}
      </DrawerItem>
      <DrawerItem name="User">
        {user}
      </DrawerItem>
      {
        secretRef
          ? renderLocalRef(pod, "Authentication Secret", secretRef, secretsApi)
          : (
            <DrawerItem name="Keyright Path">
              {keyring}
            </DrawerItem>
          )
      }
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  scaleIO: ({ gateway, system, secretRef, sslEnabled = false, protectionDomain, storagePool, storageMode = "ThinProvisioned", volumeName, fsType = "xfs", readOnly = false }, { pod }) => (
    <>
      <DrawerItem name="Gateway">
        {gateway}
      </DrawerItem>
      <DrawerItem name="System">
        {system}
      </DrawerItem>
      {renderLocalRef(pod, "Name", secretRef, secretsApi)}
      <DrawerItem name="SSL Enabled">
        {sslEnabled.toString()}
      </DrawerItem>
      <DrawerItem name="SSL Enabled">
        {sslEnabled.toString()}
      </DrawerItem>
      <DrawerItem name="Protection Domain Name" hidden={!protectionDomain}>
        {protectionDomain}
      </DrawerItem>
      <DrawerItem name="Storage Pool" hidden={!storagePool}>
        {storagePool}
      </DrawerItem>
      <DrawerItem name="Storage Mode" hidden={!storageMode}>
        {storageMode}
      </DrawerItem>
      <DrawerItem name="Volume Name">
        {volumeName}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
    </>
  ),
  secret: ({ secretName, items = [], defaultMode = 0o644, optional = false }, { pod }) => (
    <>
      {renderLocalRef(pod, "Name", { name: secretName }, secretsApi)}
      <DrawerItem name="Items" hidden={items.length === 0}>
        <ul>
          {items.map(({ key }) => <li key={key}>{key}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Default File Mode">
          0o{defaultMode.toString(8)}
      </DrawerItem>
      <DrawerItem name="Optional">
        {optional.toString()}
      </DrawerItem>
    </>
  ),
  storageos: ({ volumeName, volumeNamespace, fsType = "ext4", readOnly = false, secretRef }, { pod }) => (
    <>
      <DrawerItem name="Volume Name">
        {volumeName}
      </DrawerItem>
      <DrawerItem name="Volume Namespace" hidden={volumeNamespace === "default"}>
        {
          volumeNamespace === volumeName
            ? "- no default behaviour -"
            : volumeNamespace || pod.getNs()
        }
      </DrawerItem>
      <DrawerItem name="Filesystem type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Readonly">
        {readOnly.toString()}
      </DrawerItem>
      {secretRef && renderLocalRef(pod, "Secret", secretRef, secretsApi)}
    </>
  ),
  vsphereVolume: ({ volumePath, fsType = "ext4", storagePolicyName, storagePolicyID }) => (
    <>
      <DrawerItem name="Virtual Machine Disk Volume">
        {volumePath}
      </DrawerItem>
      <DrawerItem name="Filesystem type">
        {fsType}
      </DrawerItem>
      <DrawerItem name="Storage Policy Based Management Profile Name" hidden={!storagePolicyName}>
        {storagePolicyName}
      </DrawerItem>
      <DrawerItem name="Storage Policy Based Management Profile ID" hidden={!storagePolicyID}>
        {storagePolicyID}
      </DrawerItem>
    </>
  ),
  csi: ({ driver, readOnly = false, fsType = "ext4", volumeAttributes = {}, nodePublishSecretRef, controllerPublishSecretRef, nodeStageSecretRef, controllerExpandSecretRef }, { pod }) => (
    <>
      <DrawerItem name="Driver">
        {driver}
      </DrawerItem>
      <DrawerItem name="ReadOnly">
        {readOnly.toString()}
      </DrawerItem>
      <DrawerItem name="Filesystem Type">
        {fsType}
      </DrawerItem>
      {controllerPublishSecretRef && renderLocalRef(pod, "Controller Publish Secret", controllerPublishSecretRef, secretsApi)}
      {controllerExpandSecretRef && renderLocalRef(pod, "Controller Expand Secret", controllerExpandSecretRef, secretsApi)}
      {nodePublishSecretRef && renderLocalRef(pod, "Node Publish Secret", nodePublishSecretRef, secretsApi)}
      {nodeStageSecretRef && renderLocalRef(pod, "Node Stage Secret", nodeStageSecretRef, secretsApi)}
        {
          ...Object.entries(volumeAttributes)
            .map(([key, value]) => (
              <DrawerItem key={key} name={key}>
                {value}
              </DrawerItem>
            ))
        }
    </>
  ),
};

export interface PodVolumesProps {
  pod: Pod;
}

const deprecatedVolumeTypes = new Set<PodVolumeKind>([
  "flocker",
  "gitRepo",
  "quobyte",
  "storageos",
]);

function getVolumeType(volume: PodVolume): PodVolumeKind | undefined {
  const keys = new Set(Object.keys(volume));

  keys.delete("name"); // This key is not a kind field

  for (const key of keys) {
    // skip other random keys
    if (key in volumeRenderers) {
      const kind = key as PodVolumeKind;

      if (volume[kind] && typeof volume[kind] === "object") {
        return kind;
      }
    }
  }

  return undefined;
}

export const PodVolumes = observer(({ pod }: PodVolumesProps) => {
  if (!pod) {
    return null;
  }

  const renderVolume = (volume: PodVolume) => {
    const type = getVolumeType(volume);
    const isDeprecated = deprecatedVolumeTypes.has(type);
    const renderVolume = volumeRenderers[type];

    return (
      <div key={volume.name} className="volume">
        <div className="title flex gaps">
          <Icon small material="storage" />
          <span>{volume.name}</span>
        </div>
        {
          renderVolume
            ? (
              <>
                <DrawerItem name="Type">
                  {type}
                  {isDeprecated && <Icon title="Deprecated" material="warning_amber" />}
                </DrawerItem>
                {renderVolume(volume[type] as any, { pod, volumeName: volume.name })}
              </>
            )
            : type
              ? (
                <DrawerItem name="Type">
                  {type}
                </DrawerItem>
              )
              : <p>Error! Unknown pod volume kind</p>
        }
      </div>
    );
  };

  const volumes = pod.getVolumes();

  return (
    <DrawerSection title="Volumes" hidden={volumes.length === 0}>
      {volumes.map(renderVolume)}
    </DrawerSection>
  );
});
