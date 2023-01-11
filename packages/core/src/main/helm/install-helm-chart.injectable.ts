/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { dump } from "js-yaml";
import tempy from "tempy";
import type { JsonValue } from "type-fest";
import removePathInjectable from "../../common/fs/remove.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import execHelmInjectable from "./exec-helm/exec-helm.injectable";

export interface InstallHelmChartData {
  chart: string;
  values: JsonValue;
  name: string;
  namespace: string;
  version: string;
  kubeconfigPath: string;
}

export interface InstallHelmChartResult {
  log: string;
  release: {
    name: string;
    namespace: string;
  };
}

export type InstallHelmChart = (data: InstallHelmChartData) => Promise<InstallHelmChartResult>;

const installHelmChartInjectable = getInjectable({
  id: "install-helm-chart",
  instantiate: (di): InstallHelmChart => {
    const writeFile = di.inject(writeFileInjectable);
    const removePath = di.inject(removePathInjectable);
    const execHelm = di.inject(execHelmInjectable);

    return async ({
      chart,
      kubeconfigPath,
      name,
      namespace,
      values,
      version,
    }) => {
      const valuesFilePath = tempy.file({ name: "values.yaml" });

      await writeFile(valuesFilePath, dump(values));

      const args = ["install"];

      if (name) {
        args.push(name);
      }

      args.push(
        chart,
        "--version", version,
        "--values", valuesFilePath,
        "--namespace", namespace,
        "--kubeconfig", kubeconfigPath,
      );

      if (!name) {
        args.push("--generate-name");
      }

      try {
        const result = await execHelm(args);

        if (!result.callWasSuccessful) {
          throw result.error;
        }

        const output = result.response;
        const releaseName = output.split("\n")[0].split(" ")[1].trim();

        return {
          log: output,
          release: {
            name: releaseName,
            namespace,
          },
        };
      } finally {
        await removePath(valuesFilePath);
      }
    };
  },
});

export default installHelmChartInjectable;
