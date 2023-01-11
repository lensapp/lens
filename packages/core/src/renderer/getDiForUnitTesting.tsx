/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { noop, chunk } from "lodash/fp";
import type { Injectable } from "@ogre-tools/injectable";
import { createContainer, isInjectable, getInjectable } from "@ogre-tools/injectable";
import { Environments, setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import requestFromChannelInjectable from "./utils/channel/request-from-channel.injectable";
import { getOverrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "./cluster-frame-context/hosted-cluster-id.injectable";
import { runInAction } from "mobx";
import requestAnimationFrameInjectable from "./components/animate/request-animation-frame.injectable";
import startTopbarStateSyncInjectable from "./components/layout/top-bar/start-state-sync.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import watchHistoryStateInjectable from "./remote-helpers/watch-history-state.injectable";
import legacyOnChannelListenInjectable from "./ipc/legacy-channel-listen.injectable";
import type { GlobalOverride } from "../common/test-utils/get-global-override";
import applicationInformationInjectable from "../common/vars/application-information-injectable";
import nodeEnvInjectionToken from "../common/vars/node-env-injection-token";

export const getDiForUnitTesting = (
  opts: { doGeneralOverrides?: boolean } = {},
) => {
  const { doGeneralOverrides = false } = opts;

  const di = createContainer("renderer");

  di.register(getInjectable({
    id: "node-env",
    instantiate: () => "production",
    injectionToken: nodeEnvInjectionToken,
  }));

  di.preventSideEffects();

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  const injectables = (
    global.injectablePaths.renderer.paths
      .map(path => require(path))
      .flatMap(Object.values)
      .filter(isInjectable)
  ) as Injectable<any, any, any>[];

  runInAction(() => {
    registerMobX(di);
    di.register(applicationInformationInjectable);

    chunk(100)(injectables).forEach((chunkInjectables) => {
      di.register(...chunkInjectables);
    });
  });

  if (doGeneralOverrides) {
    for (const globalOverridePath of global.injectablePaths.renderer.globalOverridePaths) {
      const globalOverride = require(globalOverridePath).default as GlobalOverride;

      di.override(globalOverride.injectable, globalOverride.overridingInstantiate);
    }

    [
      startTopbarStateSyncInjectable,
    ].forEach((injectable) => {
      di.override(injectable, () => ({
        id: injectable.id,
        run: () => {},
      }));
    });

    di.override(terminalSpawningPoolInjectable, () => document.createElement("div"));
    di.override(hostedClusterIdInjectable, () => undefined);

    di.override(legacyOnChannelListenInjectable, () => () => noop);

    di.override(requestAnimationFrameInjectable, () => (callback) => callback());
    di.override(watchHistoryStateInjectable, () => () => () => {});

    di.override(requestFromChannelInjectable, () => () => Promise.resolve(undefined as never));

    getOverrideFsWithFakes()(di);
  }

  return di;
};
