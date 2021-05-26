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

import { ApisApi, KubeConfig, V1APIResourceList } from "@kubernetes/client-node";
import got from "got";
import pLimit from "p-limit";
import { ExtendedMap } from "../../common/utils";

export interface ApiResource {
  categories: Set<string>,
  group: Group,
  kind: string,
  name: ResourceName,
  namespaced: boolean,
  shortNames: Set<string>,
  singularName: string,
  verbs: Set<string>,
  version: Version,
}

type Group = string;
type Version = string;
type ResourceName = string;

/**
 * Mapping between groupVersions and resource names and their information
 */
export type ApiResourceMap = Map<Group, Map<Version, Map<ResourceName, ApiResource>>>;

/**
 * Get the list of all resources kubernetes knows about from the current cluster of `kc`.
 * @param kc The config of the cluster to get all resources of
 * @param throttle The max number of inflight connections at a time
 * @default throttle = 10
 * @returns A mapping of groups to a mapping of versions to mappings between the resource names and information about the resources
 */
export async function getClusterResources(kc: KubeConfig, throttle = 10): Promise<ApiResourceMap> {
  const api = kc.makeApiClient(ApisApi);
  const { body: apiGroups } = await api.getAPIVersions();
  const limit = pLimit(throttle);
  const promises: Promise<V1APIResourceList>[] = [
    // This is the legacy APIs
    limit(() => got.get(`${kc.getCurrentCluster().server}/api/v1`).json<V1APIResourceList>()),
  ];

  for (const apiGroup of apiGroups.groups) {
    for (const { groupVersion } of apiGroup.versions) {
      // This call returns a `V1APIResourceList` for the specific group version
      promises.push(limit(() => got.get(`${kc.getCurrentCluster().server}/apis/${groupVersion}`).json<V1APIResourceList>()));
    }
  }

  const apiResourceLists = await Promise.all(promises);
  const res = new ExtendedMap<string, ExtendedMap<string, ExtendedMap<string, ApiResource>>>();

  for (const apiResourceList of apiResourceLists) {
    const [group, version] = apiResourceList.groupVersion.split("/");
    const versions = res.getOrInsert(group, ExtendedMap.new);
    const resources = versions.getOrInsert(version, ExtendedMap.new);

    for (const resource of apiResourceList.resources) {
      resources.strictSet(resource.name, {
        categories: new Set(resource.categories ?? []),
        kind: resource.kind,
        name: resource.name,
        namespaced: resource.namespaced,
        shortNames: new Set(resource.shortNames),
        singularName: resource.singularName,
        verbs: new Set(resource.verbs),
        // group and version are optional fields in the Kubernetes spec, and should be derived from the parent `V1APIResourceList`
        group: resource.group || group,
        version: resource.version || version,
      });
    }
  }

  return res;
}
