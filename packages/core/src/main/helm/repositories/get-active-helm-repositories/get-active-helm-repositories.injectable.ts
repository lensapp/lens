/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmRepo } from "../../../../common/helm/helm-repo";
import type { ReadYamlFile } from "../../../../common/fs/read-yaml-file.injectable";
import readYamlFileInjectable from "../../../../common/fs/read-yaml-file.injectable";
import getHelmEnvInjectable from "../../get-helm-env/get-helm-env.injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { result } from "@k8slens/utilities";

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

    const getRepositories = getRepositoriesFor(readYamlFile);

    return async (): AsyncResult<HelmRepo[], Error> => {
      const envResult = await getHelmEnv();

      if (!envResult.isOk) {
        return result.wrapError("Failed to get helm configuration", envResult);
      }

      const {
        HELM_REPOSITORY_CONFIG: repositoryConfigFilePath,
        HELM_REPOSITORY_CACHE: helmRepositoryCacheDirPath,
      } = envResult.value;

      if (!repositoryConfigFilePath) {
        return result.error(new Error("Tried to get Helm repositories, but HELM_REPOSITORY_CONFIG was not present in `$ helm env`."));
      }

      if (!helmRepositoryCacheDirPath) {
        return result.error(new Error("Tried to get Helm repositories, but HELM_REPOSITORY_CACHE was not present in `$ helm env`."));
      }

      const updateResult = await execHelm(["repo", "update"]);

      if (!updateResult.isOk) {
        if (!updateResult.error.stderr.includes(internalHelmErrorForNoRepositoriesFound)) {
          return result.error(new Error("Failed to update helm repositories", { cause: updateResult.error.stderr }));
        }

        const resultOfAddingDefaultRepository = await execHelm(["repo", "add", "bitnami", "https://charts.bitnami.com/bitnami"]);

        if (!resultOfAddingDefaultRepository.isOk) {
          return result.error(new Error("Failed to add default helm repository", { cause: updateResult.error.stderr }));
        }
      }

      return result.ok(await getRepositories(
        repositoryConfigFilePath,
        helmRepositoryCacheDirPath,
      ));
    };
  },
});

export default getActiveHelmRepositoriesInjectable;

const getRepositoriesFor =
  (readYamlFile: ReadYamlFile) =>
    async (repositoryConfigFilePath: string, helmRepositoryCacheDirPath: string): Promise<HelmRepo[]> => {
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

const internalHelmErrorForNoRepositoriesFound = "no repositories found. You must add one before updating";
