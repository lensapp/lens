/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  asLegacyGlobalSingletonForExtensionApi,
} from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-singleton-object-for-extension-api";

import helmRepoManagerInjectable from "./helm-repo-manager.injectable";

export type HelmEnv = Partial<Record<string, string>> & {
  HELM_REPOSITORY_CACHE: string;
  HELM_REPOSITORY_CONFIG: string;
};

export interface HelmRepoConfig {
  repositories: HelmRepo[];
}

export interface HelmRepo {
  name: string;
  url: string;
  cacheFilePath?: string;
  caFile?: string;
  certFile?: string;
  insecureSkipTlsVerify?: boolean;
  keyFile?: string;
  username?: string;
  password?: string;
}

export const HelmRepoManager = asLegacyGlobalSingletonForExtensionApi(helmRepoManagerInjectable);
