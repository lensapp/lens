/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Parse kube-api path and get api-version, group, etc.

import { array } from "@k8slens/utilities";

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name?: string;
  namespace?: string;
}

export interface IKubeApiParsed extends IKubeApiLinkRef {
  apiBase: string;
  apiPrefix: string;
  apiGroup: string;
  apiVersionWithGroup: string;
}

export function parseKubeApi(path: string): IKubeApiParsed | undefined {
  const apiPath = new URL(path, "https://localhost").pathname;
  const [, prefix, ...parts] = apiPath.split("/");
  const apiPrefix = `/${prefix}`;
  const [left, right, namespaced] = array.split(parts, "namespaces");
  let apiGroup: string;
  let apiVersion: string | undefined;
  let namespace: string | undefined;
  let resource: string;
  let name: string | undefined;

  if (namespaced) {
    switch (right.length) {
      case 1:
        name = right[0];
        // fallthrough
      case 0:
        resource = "namespaces"; // special case this due to `split` removing namespaces
        break;
      default:
        [namespace, resource, name] = right;
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    apiVersion = left.at(-1)!;
    const rest = left.slice(0, -1);

    apiGroup = rest.join("/");
  } else {
    if (left.length === 0) {
      return undefined;
    }

    if (left.length === 1 || left.length === 2) {
      [apiVersion, resource] = left;
      apiGroup = "";
    } else if (left.length === 4) {
      [apiGroup, apiVersion, resource, name] = left;
    } else {
      /**
       * Given that
       *  - `apiVersion` is `GROUP/VERSION` and
       *  - `VERSION` is `DNS_LABEL` which is /^[a-z0-9]((-[a-z0-9])|[a-z0-9])*$/i
       *     where length <= 63
       *  - `GROUP` is /^D(\.D)*$/ where D is `DNS_LABEL` and length <= 253
       *
       * There is no well defined selection from an array of items that were
       * separated by '/'
       *
       * Solution is to create a heuristic. Namely:
       * 1. if '.' in left[0] then apiGroup <- left[0]
       * 2. if left[1] matches /^v[0-9]/ then apiGroup, apiVersion <- left[0], left[1]
       * 3. otherwise assume apiVersion <- left[0]
       * 4. always resource, name <- left[(0 or 1)+1..]
       */
      if (left[0].includes(".") || left[1].match(/^v[0-9]/)) {
        [apiGroup, apiVersion] = left;
        resource = left.slice(2).join("/");
      } else {
        apiGroup = "";
        apiVersion = left[0];
        [resource, name] = left.slice(1);
      }
    }
  }

  const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join("/");
  const apiBase = [apiPrefix, apiGroup, apiVersion, resource].filter(v => v).join("/");

  return {
    apiBase,
    apiPrefix, apiGroup,
    apiVersion, apiVersionWithGroup,
    namespace, resource, name,
  };
}

function isIKubeApiParsed(refOrParsed: IKubeApiLinkRef | IKubeApiParsed): refOrParsed is IKubeApiParsed {
  return "apiGroup" in refOrParsed && !!refOrParsed.apiGroup;
}

export function createKubeApiURL(linkRef: IKubeApiLinkRef): string;
export function createKubeApiURL(linkParsed: IKubeApiParsed): string;

export function createKubeApiURL(ref: IKubeApiLinkRef | IKubeApiParsed): string {
  if (isIKubeApiParsed(ref)) {
    return createKubeApiURL({
      apiPrefix: ref.apiPrefix,
      resource: ref.resource,
      name: ref.name,
      namespace: ref.namespace,
      apiVersion: `${ref.apiGroup}/${ref.apiVersion}`,
    });
  }

  const { apiPrefix = "/apis", resource, apiVersion, name, namespace } = ref;
  const parts = [apiPrefix, apiVersion];

  if (namespace) {
    parts.push("namespaces", namespace);
  }

  parts.push(resource);

  if (name) {
    parts.push(name);
  }

  return parts.join("/");
}
