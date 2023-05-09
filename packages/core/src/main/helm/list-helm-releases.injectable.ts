/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import { json, result, isObject } from "@k8slens/utilities";
import type { ListedHelmRelease } from "../../features/helm-releases/common/channels";

export type ListHelmReleases = (pathToKubeconfig: string, namespace?: string) => AsyncResult<ListedHelmRelease[], Error>;

const listHelmReleasesInjectable = getInjectable({
  id: "list-helm-releases",
  instantiate: (di): ListHelmReleases => {
    const execHelm = di.inject(execHelmInjectable);

    return async (pathToKubeconfig, namespace) => {
      const args = [
        "ls",
        "--all",
        // By default 256 results are listed, we want to list practically all
        "--max", "9999",
        "--output", "json",
      ];

      if (namespace) {
        args.push("-n", namespace);
      } else {
        args.push("--all-namespaces");
      }

      args.push("--kubeconfig", pathToKubeconfig);

      const helmResult = await execHelm(args);

      if (!helmResult.isOk) {
        return result.wrapError("Failed to list helm releases", helmResult);
      }

      const parseResult = json.parse(helmResult.value);

      if (!parseResult.isOk) {
        return result.wrapError("Failed to parse response from 'helm ls --all'", parseResult);
      }

      const output = Array.isArray(parseResult.value)
        ? parseResult.value.filter(isObject)
        : [];

      return {
        isOk: true,
        value: output as unknown as ListedHelmRelease[],
      };
    };
  },
});

export default listHelmReleasesInjectable;
