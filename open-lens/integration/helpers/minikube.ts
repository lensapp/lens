/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { spawnSync } from "child_process";

export function minikubeReady(testNamespace: string): boolean {
  // determine if minikube is running
  {
    const { status } = spawnSync("minikube status", { shell: true });

    if (status !== 0) {
      console.warn("minikube not running");

      return false;
    }
  }

  // Remove TEST_NAMESPACE if it already exists
  {
    const { status } = spawnSync(`minikube kubectl -- get namespace ${testNamespace}`, { shell: true });

    if (status === 0) {
      console.warn(`Removing existing ${testNamespace} namespace`);

      const { status, stdout, stderr } = spawnSync(
        `minikube kubectl -- delete namespace ${testNamespace}`,
        { shell: true },
      );

      if (status !== 0) {
        console.warn(`Error removing ${testNamespace} namespace: ${stderr.toString()}`);

        return false;
      }

      console.log(stdout.toString());
    }
  }

  return true;
}
