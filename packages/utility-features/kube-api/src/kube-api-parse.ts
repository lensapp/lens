/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { pipeline } from "@ogre-tools/fp";
import { compact, join } from "lodash/fp";
import { getMatchFor } from "./get-match-for";
import { prepend } from "./prepend";

// Parse kube-api path and get api-version, group, etc.

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

const withoutDomainAddressOrParameters = (path: string) => new URL(path, "http://irrelevant").pathname;

const getKubeApiPathMatch = getMatchFor(
  /^\/(?<apiOrApis>apis)\/(?<apiGroup>[^/]+?)\/(?<apiVersion>[^/]+?)\/namespaces\/(?<namespace>[^/]+?)\/(?<resource>[^/]+?)\/(?<name>[^/]+?)$/,
  /^\/(?<apiOrApis>apis)\/(?<apiGroup>[^/]+?)\/(?<apiVersion>[^/]+?)\/namespaces\/(?<namespace>[^/]+?)\/(?<resource>[^/]+?)$/,
  /^\/(?<apiOrApis>api)\/(?<apiVersion>[^/]+?)\/namespaces\/(?<namespace>[^/]+?)\/(?<resource>[^/]+?)\/(?<name>[^/]+?)$/,
  /^\/(?<apiOrApis>apis)\/(?<apiGroup>[^/]+?)\/(?<apiVersion>[^/]+?)\/(?<resource>[^/]+?)\/(?<name>[^/]+?)$/,
  /^\/(?<apiOrApis>api)\/(?<apiVersion>[^/]+?)\/namespaces\/(?<namespace>[^/]+?)\/(?<resource>[^/]+?)$/,
  /^\/(?<apiOrApis>apis)\/(?<apiGroup>[^/]+?)\/(?<apiVersion>[^/]+?)\/(?<resource>[^/]+?)$/,
  /^\/(?<apiOrApis>api)\/(?<apiVersion>[^/]+?)\/(?<resource>[^/]+?)\/(?<name>[^/]+?)$/,
  /^\/(?<apiOrApis>api)\/(?<apiVersion>[^/]+?)\/(?<resource>[^/]+?)$/,
);

const getParsedPath = (path: string) =>
  pipeline(path, withoutDomainAddressOrParameters, getKubeApiPathMatch, (match) => match?.groups);

const joinTruthy = (delimiter: string) => (toBeJoined: string[]) => pipeline(toBeJoined, compact, join(delimiter));

const getApiBase = (apiOrApis: string, apiGroup: string, apiVersion: string, resource: string) =>
  pipeline([apiOrApis, apiGroup, apiVersion, resource], joinTruthy("/"), prepend("/"));

const getApiPrefix = prepend("/");

const getApiVersionWithGroup = (apiGroup: string, apiVersion: string) => joinTruthy("/")([apiGroup, apiVersion]);

const getApiGroup = (apiGroup: string) => apiGroup || "";

export function parseKubeApi(path: string | undefined): IKubeApiParsed | undefined {
  if (!path) {
    return undefined;
  }

  const parsedPath = getParsedPath(path);

  if (!parsedPath) {
    return undefined;
  }

  const { apiOrApis, apiGroup, namespace, apiVersion, resource, name } = parsedPath;

  return {
    apiBase: getApiBase(apiOrApis, apiGroup, apiVersion, resource),
    apiPrefix: getApiPrefix(apiOrApis),
    apiGroup: getApiGroup(apiGroup),
    apiVersion,
    apiVersionWithGroup: getApiVersionWithGroup(apiGroup, apiVersion),
    namespace,
    resource,
    name,
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
