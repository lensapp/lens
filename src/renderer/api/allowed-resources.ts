/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { action, makeObservable, observable, reaction } from "mobx";
import type { ClusterId } from "../../common/cluster-store";
import { ClusterResourceIsAllowedChannel, ClusterGetResourcesChannel, requestMain } from "../../common/ipc";
import { Disposer, Singleton } from "../utils";
import type { ApiResourceMap } from "../../main/utils/api-resources";
import { ObservableTimer } from "../../common/utils/observable-timer";
import { Notifications } from "../components/notifications";

type NamespaceName = string;

export interface KubeObject {
  apiBase: string;
}

export class AllowedResources extends Singleton {
  protected allowedResources = observable.set<string>();
  @observable public resources: ApiResourceMap;

  /**
   * This being `true` means that this has successfully loaded once
   */
  @observable loaded = false;

  protected timer = new ObservableTimer(60 * 1000);
  disposer: Disposer;

  constructor(protected clusterId: ClusterId, protected getNamespaces: () => NamespaceName[]) {
    super();
    makeObservable(this);
  }

  @action
  async init() {
    try {
      this.resources = await requestMain(ClusterGetResourcesChannel, this.clusterId);
    } catch (error) {
      console.error("[ALLOWED-RESOURCES]: failed to initialize resources", error);
      Notifications.error("Failed to initialize resources");
    }

    await this.refresh(this.getNamespaces());
    this.loaded = true;

    this.disposer = reaction(
      () => [this.timer.tickCount, this.getNamespaces()] as const,
      ([, namespaces]) => this.refresh(namespaces),
    );
  }

  @action
  private async refresh(namespaces: NamespaceName[]) {
    try {
      this.allowedResources.replace(await requestMain(ClusterResourceIsAllowedChannel, this.clusterId, namespaces));
    } catch (error) {
      console.error("[ALLOWED-RESOURCES]: failed to refresh", error, { namespaces });
      Notifications.error("Failed to refresh allowed resources");
    }
  }

  /**
   * Get the permissive list permissions of `name` over `namespaces`
   * @param obj The name of the resource
   * @param namespaces The list of namespaces to check (should be `NamepaceSelectFilter` selected ones)
   * @returns `true` if the resource exists; is cluster scoped and can be listed, or is namespaced and can be listed in at least one of the namespaces
   */
  isAllowed(obj: KubeObject): boolean {
    return this.allowedResources.has(obj.apiBase);
  }
}

/**
 * Get list permissions for a single resource
 * @param obj The name of the resource to check if it is allowed to be listed
 * @returns `true` if the resource exists on the cluster and the cluster has list permissions for that resource
 */
export function isAllowedResource(obj: KubeObject) {
  return AllowedResources.getInstance().isAllowed(obj);
}

/**
 * Get list permissions for several resources
 * @param objs Several names of resources
 * @returns `true` iff `∀ name ∈ names : isAllowedResource(name)`
 */
export function isAllowedResources(...objs: KubeObject[]) {
  return objs.map(isAllowedResource).every(Boolean);
}

/**
 * Get permissive list permissions over several resources
 * @param objs Several names of resources
 * @returns `true` iff `!∀ name ∈ names : !isAllowedResource(name)`
 */
export function isAnyAllowedResources(...objs: KubeObject[]) {
  if (objs.length === 0) {
    return true;
  }

  return objs.map(isAllowedResource).some(Boolean);
}
