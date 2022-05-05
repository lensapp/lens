/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Parse kube-api path and get api-version, group, etc.

import { splitArray } from "../utils";

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name?: string;
  namespace?: string;
}

export interface IKubeApiParsed extends IKubeApiLinkRef {
  apiBase: string;
  apiGroup: string;
  apiVersionWithGroup: string;
}

export function parseKubeApi(path: string): IKubeApiParsed {
  const apiPath = new URL(path, "http://localhost").pathname;
  const [, prefix, ...parts] = apiPath.split("/");
  const apiPrefix = `/${prefix}`;
  const [left, right, namespaced] = splitArray(parts, "namespaces");
  let apiGroup!: string;
  let apiVersion!: string;
  let namespace!: string;
  let resource!: string;
  let name!: string;

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
    apiVersion = left.pop()!;
    apiGroup = left.join("/");
  } else {
    switch (left.length) {
      case 0:
        throw new Error(`invalid apiPath: ${apiPath}`);
      case 4:
        [apiGroup, apiVersion, resource, name] = left;
        break;
      case 2:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resource = left.pop()!;
        // fallthrough
      case 1:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        apiVersion = left.pop()!;
        apiGroup = "";
        break;
      default:
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
        break;
    }
  }

  const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join("/");
  const apiBase = [apiPrefix, apiGroup, apiVersion, resource].filter(v => v).join("/");

  if (!apiBase) {
    throw new Error(`invalid apiPath: ${apiPath}`);
  }

  return {
    apiBase,
    apiPrefix, apiGroup,
    apiVersion, apiVersionWithGroup,
    namespace, resource, name,
  };
}

export function createKubeApiURL({ apiPrefix = "/apis", resource, apiVersion, name, namespace }: IKubeApiLinkRef): string {
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
