/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubectlDependencies } from "./kubectl";
import { Kubectl } from "./kubectl";
import directoryForKubectlBinariesInjectable from "../../common/app-paths/directory-for-kubectl-binaries/directory-for-kubectl-binaries.injectable";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import kubectlDownloadingNormalizedArchInjectable from "./normalized-arch.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import kubectlBinaryNameInjectable from "./binary-name.injectable";
import bundledKubectlBinaryPathInjectable from "./bundled-binary-path.injectable";
import baseBundeledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";

const createKubectlInjectable = getInjectable({
  id: "create-kubectl",

  instantiate: (di) => {
    const dependencies: KubectlDependencies = {
      userStore: di.inject(userStoreInjectable),
      directoryForKubectlBinaries: di.inject(directoryForKubectlBinariesInjectable),
      normalizedDownloadArch: di.inject(kubectlDownloadingNormalizedArchInjectable),
      normalizedDownloadPlatform: di.inject(normalizedPlatformInjectable),
      kubectlBinaryName: di.inject(kubectlBinaryNameInjectable),
      bundledKubectlBinaryPath: di.inject(bundledKubectlBinaryPathInjectable),
      baseBundeledBinariesDirectory: di.inject(baseBundeledBinariesDirectoryInjectable),
    };

    return (clusterVersion: string) => new Kubectl(dependencies, clusterVersion);
  },
});

export default createKubectlInjectable;
