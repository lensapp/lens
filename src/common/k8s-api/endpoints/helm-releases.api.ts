/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiBase } from "../index";
import type { ItemObject } from "../../item.store";
import type { JsonApiData } from "../json-api";
import { buildURLPositional } from "../../utils/buildUrl";
import type { HelmReleaseDetails } from "../../../renderer/components/+helm-releases/release-details/release-details-model/call-for-helm-release/call-for-helm-release-details/call-for-helm-release-details.injectable";

export interface HelmReleaseUpdateDetails {
  log: string;
  release: HelmReleaseDetails;
}

export interface HelmReleaseRevision {
  revision: number;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
  description: string;
}

type EndpointParams = {}
  | { namespace: string }
  | { namespace: string; name: string }
  | { namespace: string; name: string; route: string };

interface EndpointQuery {
  all?: boolean;
}

export const endpoint = buildURLPositional<EndpointParams, EndpointQuery>("/v2/releases/:namespace?/:name?/:route?");

export async function deleteRelease(name: string, namespace: string): Promise<JsonApiData> {
  const path = endpoint({ name, namespace });

  return apiBase.del(path);
}

export async function getReleaseValues(name: string, namespace: string, all?: boolean): Promise<string> {
  const route = "values";
  const path = endpoint({ name, namespace, route }, { all });

  return apiBase.get<string>(path);
}

export async function getReleaseHistory(name: string, namespace: string): Promise<HelmReleaseRevision[]> {
  const route = "history";
  const path = endpoint({ name, namespace, route });

  return apiBase.get(path);
}

export async function rollbackRelease(name: string, namespace: string, revision: number): Promise<JsonApiData> {
  const route = "rollback";
  const path = endpoint({ name, namespace, route });
  const data = { revision };

  return apiBase.put(path, { data });
}

export interface HelmReleaseDto {
  appVersion: string;
  name: string;
  namespace: string;
  chart: string;
  status: string;
  updated: string;
  revision: string;
}

export interface HelmRelease extends HelmReleaseDto, ItemObject {
  getNs: () => string;
  getChart: (withVersion?: boolean) => string;
  getRevision: () => number;
  getStatus: () => string;
  getVersion: () => string;
  getUpdated: (humanize?: boolean, compact?: boolean) => string | number;
  getRepo: () => Promise<string>;
}
