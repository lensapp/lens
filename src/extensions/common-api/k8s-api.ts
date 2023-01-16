/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// NOTE: this file is not currently exported as part of `Common`, but should be.
//       It is here to consolidate the common parts which are exported to `Main`
//       and to `Renderer`

import apiManagerInjectable from "../../common/k8s-api/api-manager/manager.injectable";
import createKubeApiForClusterInjectable from "../../common/k8s-api/create-kube-api-for-cluster.injectable";
import createKubeApiForRemoteClusterInjectable from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
import createResourceStackInjectable from "../../common/k8s/create-resource-stack.injectable";
import type { ResourceApplyingStack } from "../../common/k8s/resource-stack";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import type { KubernetesCluster } from "./catalog";
import type { KubeApiDataFrom, KubeObjectStoreOptions } from "../../common/k8s-api/kube-object.store";
import { KubeObjectStore as InternalKubeObjectStore } from "../../common/k8s-api/kube-object.store";
import type { KubeJsonApiDataFor, KubeObject } from "../../common/k8s-api/kube-object";
import type { DerivedKubeApiOptions, KubeApiDependencies, KubeApiOptions } from "../../common/k8s-api/kube-api";
import { KubeApi as InternalKubeApi } from "../../common/k8s-api/kube-api";
import clusterFrameContextForNamespacedResourcesInjectable from "../../renderer/cluster-frame-context/for-namespaced-resources.injectable";
import type { ClusterContext } from "../../renderer/cluster-frame-context/cluster-frame-context";
import loggerInjectable from "../../common/logger.injectable";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import maybeKubeApiInjectable from "../../common/k8s-api/maybe-kube-api.injectable";
import { DeploymentApi as InternalDeploymentApi, IngressApi as InternalIngressApi, NodeApi, PersistentVolumeClaimApi, PodApi } from "../../common/k8s-api/endpoints";
import { storesAndApisCanBeCreatedInjectionToken } from "../../common/k8s-api/stores-apis-can-be-created.token";
import type { JsonApiConfig } from "../../common/k8s-api/json-api";
import type { KubeJsonApi as InternalKubeJsonApi } from "../../common/k8s-api/kube-json-api";
import createKubeJsonApiInjectable from "../../common/k8s-api/create-kube-json-api.injectable";
import type { RequestInit } from "node-fetch";

export const apiManager = asLegacyGlobalForExtensionApi(apiManagerInjectable);
export const forCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForClusterInjectable);
export const forRemoteCluster = asLegacyGlobalFunctionForExtensionApi(createKubeApiForRemoteClusterInjectable);
export const createResourceStack = asLegacyGlobalFunctionForExtensionApi(createResourceStackInjectable);

const getKubeApiDeps = (): KubeApiDependencies => {
  const di = getLegacyGlobalDiForExtensionApi();

  return {
    logger: di.inject(loggerInjectable),
    maybeKubeApi: di.inject(maybeKubeApiInjectable),
  };
};

// NOTE: this is done to preserve `instanceOf` behaviour
function KubeApiCstr<
  Object extends KubeObject = KubeObject,
  Data extends KubeJsonApiDataFor<Object> = KubeJsonApiDataFor<Object>,
>(opts: KubeApiOptions<Object, Data>) {
  const api = new InternalKubeApi(getKubeApiDeps(), opts);

  const di = getLegacyGlobalDiForExtensionApi();
  const storesAndApisCanBeCreated = di.inject(storesAndApisCanBeCreatedInjectionToken);

  if (storesAndApisCanBeCreated) {
    apiManager.registerApi(api);
  }

  return api;
}

export const KubeApi = KubeApiCstr as unknown as new<
  Object extends KubeObject = KubeObject,
  Data extends KubeJsonApiDataFor<Object> = KubeJsonApiDataFor<Object>,
>(opts: KubeApiOptions<Object, Data>) => InternalKubeApi<Object, Data>;

/**
 * @deprecated Switch to using `Common.createResourceStack` instead
 */
export class ResourceStack implements ResourceApplyingStack {
  private readonly impl: ResourceApplyingStack;

  constructor(cluster: KubernetesCluster, name: string) {
    this.impl = createResourceStack(cluster, name);
  }

  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlApplyFolder(folderPath, templateContext, extraArgs);
  }

  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[] | undefined): Promise<string> {
    return this.impl.kubectlDeleteFolder(folderPath, templateContext, extraArgs);
  }
}

/**
 * @deprecated This type is unused
 */
export interface IKubeApiCluster {
  metadata: {
    uid: string;
  };
}

export type { CreateKubeApiForRemoteClusterConfig as IRemoteKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-remote-cluster.injectable";
export type { CreateKubeApiForLocalClusterConfig as ILocalKubeApiConfig } from "../../common/k8s-api/create-kube-api-for-cluster.injectable";

export {
  KubeObject,
  KubeStatus,
  type OwnerReference,
  type KubeObjectMetadata,
  type NamespaceScopedMetadata,
  type ClusterScopedMetadata,
  type BaseKubeJsonApiObjectMetadata,
  type KubeJsonApiObjectMetadata,
  type KubeStatusData,
} from "../../common/k8s-api/kube-object";

export type {
  KubeJsonApiData,
} from "../../common/k8s-api/kube-json-api";

function KubeJsonApiCstr(config: JsonApiConfig, reqInit?: RequestInit) {
  const di = getLegacyGlobalDiForExtensionApi();
  const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);

  return createKubeJsonApi(config, reqInit);
}

export const KubeJsonApi = Object.assign(
  KubeJsonApiCstr as unknown as new (config: JsonApiConfig, reqInit?: RequestInit) => InternalKubeJsonApi,
  {
    forCluster,
  },
);

export abstract class KubeObjectStore<
  K extends KubeObject = KubeObject,
  A extends InternalKubeApi<K, D> = InternalKubeApi<K, KubeJsonApiDataFor<K>>,
  D extends KubeJsonApiDataFor<K> = KubeApiDataFrom<K, A>,
> extends InternalKubeObjectStore<K, A, D> {
  /**
   * @deprecated This is no longer used and shouldn't have been every really used
   */
  static readonly context = {
    set: (ctx: ClusterContext) => {
      console.warn("Setting KubeObjectStore.context is no longer supported");
      void ctx;
    },
    get: () => asLegacyGlobalForExtensionApi(clusterFrameContextForNamespacedResourcesInjectable),
  };

  get context() {
    return this.dependencies.context;
  }

  constructor(api: A, opts?: KubeObjectStoreOptions);
  /**
   * @deprecated Supply API instance through constructor
   */
  constructor();
  constructor(api?: A, opts?: KubeObjectStoreOptions) {
    const di = getLegacyGlobalDiForExtensionApi();

    super(
      {
        context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
        logger: di.inject(loggerInjectable),
      },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      api!,
      opts,
    );
  }
}

export {
  type JsonPatch,
  type KubeObjectStoreLoadAllParams,
  type KubeObjectStoreLoadingParams,
  type KubeObjectStoreSubscribeParams,
} from "../../common/k8s-api/kube-object.store";

/**
 * @deprecated This type is only present for backwards compatable typescript support
 */
export interface IgnoredKubeApiOptions {
  /**
   * @deprecated this option is overridden and should not be used
   */
  objectConstructor?: any;
  /**
   * @deprecated this option is overridden and should not be used
   */
  kind?: any;
  /**
   * @deprecated this option is overridden and should not be used
   */
  isNamespaces?: any;
  /**
   * @deprecated this option is overridden and should not be used
   */
  apiBase?: any;
}

// NOTE: these *Constructor functions MUST be `function` to work with `new X()`
function PodsApiConstructor(opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) {
  return new PodApi(getKubeApiDeps(), opts);
}

export const PodsApi = PodsApiConstructor as unknown as new (opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) => PodApi;

function NodesApiConstructor(opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) {
  return new NodeApi(getKubeApiDeps(), opts);
}

export const NodesApi = NodesApiConstructor as unknown as new (opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) => NodeApi;

function DeploymentApiConstructor(opts?: DerivedKubeApiOptions) {
  return new InternalDeploymentApi(getKubeApiDeps(), opts);
}

export const DeploymentApi = DeploymentApiConstructor as unknown as new (opts?: DerivedKubeApiOptions) => InternalDeploymentApi;

function IngressApiConstructor(opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) {
  return new InternalIngressApi(getKubeApiDeps(), opts);
}

export const IngressApi = IngressApiConstructor as unknown as new (opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) => InternalIngressApi;

function PersistentVolumeClaimsApiConstructor(opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) {
  return new PersistentVolumeClaimApi(getKubeApiDeps(), opts);
}

export const PersistentVolumeClaimsApi = PersistentVolumeClaimsApiConstructor as unknown as new (opts?: DerivedKubeApiOptions & IgnoredKubeApiOptions) => PersistentVolumeClaimApi;

export {
  type Container as IPodContainer,
  type PodContainerStatus as IPodContainerStatus,
  Pod,
  Node,
  Deployment,
  DaemonSet,
  StatefulSet,
  Job,
  CronJob,
  ConfigMap,
  type SecretReference as ISecretRef,
  Secret,
  ReplicaSet,
  ResourceQuota,
  LimitRange,
  HorizontalPodAutoscaler,
  PodDisruptionBudget,
  PriorityClass,
  Service,
  Endpoints as Endpoint,
  Ingress,
  NetworkPolicy,
  PersistentVolume,
  PersistentVolumeClaim,
  StorageClass,
  Namespace,
  KubeEvent,
  ServiceAccount,
  Role,
  RoleBinding,
  ClusterRole,
  ClusterRoleBinding,
  CustomResourceDefinition,
} from "../../common/k8s-api/endpoints";
