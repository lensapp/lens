/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../common/helm-repo";
import type { ReadYamlFile } from "../../../../common/fs/read-yaml-file.injectable";
import readYamlFileInjectable from "../../../../common/fs/read-yaml-file.injectable";
import getHelmEnvInjectable from "../../get-helm-env/get-helm-env.injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { isEmpty } from "lodash/fp";
import loggerInjectable from "../../../../common/logger.injectable";

interface HelmRepositoryFromYaml {
  name: string;
  url: string;
  caFile: string;
  certFile: string;
  insecure_skip_tls_verify: boolean;
  keyFile: string;
  pass_credentials_all: boolean;
  password: string;
  username: string;
}

export interface HelmRepositoriesFromYaml {
  repositories: HelmRepositoryFromYaml[];
}

const getActiveHelmRepositoriesInjectable = getInjectable({
  id: "get-helm-repositories",

  instantiate: (di) => {
    const readYamlFile = di.inject(readYamlFileInjectable);
    const execHelm = di.inject(execHelmInjectable);
    const getHelmEnv = di.inject(getHelmEnvInjectable);
    const logger = di.inject(loggerInjectable);

    const getRepositoriesFor = getRepositoriesForFor(readYamlFile);

    return async (): Promise<HelmRepo[]> => {
      const { HELM_REPOSITORY_CONFIG: repositoryConfigFilePath, HELM_REPOSITORY_CACHE: helmRepositoryCacheDirPath } = await getHelmEnv();

      if (!repositoryConfigFilePath) {
        logger.warn("Tried to get Helm repositories, but HELM_REPOSITORY_CONFIG was not present in `$ helm env`. Behaving as if there were no repositories.");

        return [];
      }

      if (!helmRepositoryCacheDirPath) {
        logger.warn("Tried to get Helm repositories, but HELM_REPOSITORY_CACHE was not present in `$ helm env`. Behaving as if there were no repositories.");

        return [];
      }

      if (!repositoryConfigFilePath || !helmRepositoryCacheDirPath) {
        return [];
      }

      const getRepositories = getRepositoriesFor(
        repositoryConfigFilePath,
        helmRepositoryCacheDirPath,
      );

      await execHelm("repo", "update");

      const repositories = await getRepositories();

      if (isEmpty(repositories)) {
        await execHelm("repo", "add", "bitnami", "https://charts.bitnami.com/bitnami");

        return await getRepositories();
      }

      return repositories;
    };
  },
});

export default getActiveHelmRepositoriesInjectable;

const getRepositoriesForFor =
  (readYamlFile: ReadYamlFile) =>
    (repositoryConfigFilePath: string, helmRepositoryCacheDirPath: string) =>
      async () => {
        const { repositories } = (await readYamlFile(
          repositoryConfigFilePath,
        )) as HelmRepositoriesFromYaml;

        return repositories.map((repository) => ({
          name: repository.name,
          url: repository.url,
          caFile: repository.caFile,
          certFile: repository.certFile,
          insecureSkipTlsVerify: repository.insecure_skip_tls_verify,
          keyFile: repository.keyFile,
          username: repository.username,
          password: repository.password,
          cacheFilePath: `${helmRepositoryCacheDirPath}/${repository.name}-index.yaml`,
        }));
      };
