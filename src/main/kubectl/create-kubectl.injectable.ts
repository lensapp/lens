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
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";
import bundledKubectlVersionInjectable from "../../common/vars/bundled-kubectl-version.injectable";
import kubectlVersionMapInjectable from "./version-map.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import getBasenameOfPathInjectable from "../../common/path/get-basename.injectable";

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
      baseBundeledBinariesDirectory: di.inject(baseBundledBinariesDirectoryInjectable),
      bundledKubectlVersion: di.inject(bundledKubectlVersionInjectable),
      kubectlVersionMap: di.inject(kubectlVersionMapInjectable),
      getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
      joinPaths: di.inject(joinPathsInjectable),
      getBasenameOfPath: di.inject(getBasenameOfPathInjectable),
    };

    return (clusterVersion: string) => new Kubectl(dependencies, clusterVersion);
  },
});

export default createKubectlInjectable;
