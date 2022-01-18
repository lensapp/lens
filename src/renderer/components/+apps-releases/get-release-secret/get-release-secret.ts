/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import type { SecretsStore } from "../../+config-secrets/secrets.store";

interface Dependencies {
  secretsStore: SecretsStore;
}

export const getReleaseSecret =
  ({ secretsStore }: Dependencies) =>
    (release: HelmRelease) =>
      secretsStore
        .getByLabel({
          owner: "helm",
          name: release.getName(),
        })
        .find((secret) => secret.getNs() == release.getNs());
