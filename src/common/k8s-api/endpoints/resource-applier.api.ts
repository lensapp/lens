/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import yaml from "js-yaml";
import type { KubeJsonApiData } from "../kube-json-api";
import { apiBase } from "../index";
import type { Patch } from "rfc6902";

export const annotations = [
  "kubectl.kubernetes.io/last-applied-configuration",
];

export async function update(resource: object | string): Promise<KubeJsonApiData> {
  if (typeof resource === "string") {
    const parsed = yaml.load(resource);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Cannot update resource to string or number");
    }

    resource = parsed;
  }

  return apiBase.post<KubeJsonApiData>("/stack", { data: resource });
}

export async function patch(name: string, kind: string, ns: string | undefined, patch: Patch): Promise<KubeJsonApiData> {
  return apiBase.patch<KubeJsonApiData>("/stack", {
    data: {
      name,
      kind,
      ns,
      patch,
    },
  });
}
