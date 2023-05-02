/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/cluster/cluster";
import directoryForTempInjectable from "../../common/app-paths/directory-for-temp/directory-for-temp.injectable";
import { KubeconfigManager } from "./kubeconfig-manager";
import { loggerInjectionToken } from "@k8slens/logger";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import pathExistsInjectable from "../../common/fs/path-exists.injectable";
import writeFileInjectable from "../../common/fs/write-file.injectable";
import removePathInjectable from "../../common/fs/remove.injectable";
import lensProxyCertificateInjectable from "../../common/certificate/lens-proxy-certificate.injectable";
import kubeAuthProxyServerInjectable from "../cluster/kube-auth-proxy-server.injectable";
import kubeAuthProxyUrlInjectable from "../cluster/auth-proxy-url.injectable";
import loadKubeconfigInjectable from "../../common/cluster/load-kubeconfig.injectable";

const kubeconfigManagerInjectable = getInjectable({
  id: "kubeconfig-manager",

  instantiate: (di, cluster) => new KubeconfigManager(
    {
      directoryForTemp: di.inject(directoryForTempInjectable),
      logger: di.inject(loggerInjectionToken),
      joinPaths: di.inject(joinPathsInjectable),
      getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
      removePath: di.inject(removePathInjectable),
      pathExists: di.inject(pathExistsInjectable),
      writeFile: di.inject(writeFileInjectable),
      certificate: di.inject(lensProxyCertificateInjectable).get(),
      loadKubeconfig: di.inject(loadKubeconfigInjectable, cluster),
      kubeAuthProxyServer: di.inject(kubeAuthProxyServerInjectable, cluster),
      kubeAuthProxyUrl: di.inject(kubeAuthProxyUrlInjectable, cluster),
    },
    cluster,
  ),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default kubeconfigManagerInjectable;
