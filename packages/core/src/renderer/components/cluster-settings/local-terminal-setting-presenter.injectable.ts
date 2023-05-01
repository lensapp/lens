/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { Cluster } from "../../../common/cluster/cluster";
import loadKubeconfigInjectable from "../../../common/cluster/load-kubeconfig.injectable";

export interface LocalTerminalSettingPresenter {
  readonly directory: {
    get: () => string;
    set: (value: string) => void;
  };
  readonly defaultNamespace: {
    get: () => string;
    set: (value: string) => void;
  };
  readonly placeholderDefaultNamespace: string;
}

const localTerminalSettingPresenterInjectable = getInjectable({
  id: "local-terminal-setting-presenter",
  instantiate: async (di, cluster: Cluster): Promise<LocalTerminalSettingPresenter> => {
    const loadKubeconfig = di.inject(loadKubeconfigInjectable, cluster);

    const result = await loadKubeconfig();

    if (result.isOk === false) {
      throw result.error;
    }

    const kubeConfig = result.value;
    const directory = observable.box(cluster.preferences.terminalCWD || "");
    const defaultNamespace = observable.box(cluster.preferences.defaultNamespace || "");
    const placeholderDefaultNamespace = kubeConfig.getContextObject(cluster.contextName.get())?.namespace || "default";

    return {
      directory: {
        get: () => directory.get(),
        set: (value) => directory.set(value),
      },
      defaultNamespace: {
        get: () => defaultNamespace.get(),
        set: (value) => defaultNamespace.set(value),
      },
      placeholderDefaultNamespace,
    };
  },
  lifecycle: lifecycleEnum.transient,
});

export default localTerminalSettingPresenterInjectable;
