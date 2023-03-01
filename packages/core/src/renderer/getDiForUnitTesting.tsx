/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { noop, chunk } from "lodash/fp";
import { createContainer, isInjectable } from "@ogre-tools/injectable";
import requestFromChannelInjectable from "./utils/channel/request-from-channel.injectable";
import { getOverrideFsWithFakes } from "../test-utils/override-fs-with-fakes";
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "./cluster-frame-context/hosted-cluster-id.injectable";
import { runInAction } from "mobx";
import requestAnimationFrameInjectable from "./components/animate/request-animation-frame.injectable";
import startTopbarStateSyncInjectable from "./components/layout/top-bar/start-state-sync.injectable";
import watchHistoryStateInjectable from "./remote-helpers/watch-history-state.injectable";
import legacyOnChannelListenInjectable from "./ipc/legacy-channel-listen.injectable";
import type { GlobalOverride } from "../common/test-utils/get-global-override";

import {
  setLegacyGlobalDiForExtensionApi
} from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import {
  registerMobX,
} from "@ogre-tools/injectable-extension-for-mobx";
import { registerInjectableReact } from "@ogre-tools/injectable-react";

export const getDiForUnitTesting = (
  opts: { doGeneralOverrides?: boolean } = {},
) => {
  const { doGeneralOverrides = false } = opts;

  const environment = "renderer";
  const di = createContainer(environment);

  registerMobX(di);
  registerInjectableReact(di);
  setLegacyGlobalDiForExtensionApi(di, environment);

  di.preventSideEffects();

  runInAction(() => {
    const injectables = global.injectablePaths.renderer.paths
      .map(path => require(path))
      .flatMap(Object.values)
      .filter(isInjectable);

    for (const block of chunk(100)(injectables)) {
      di.register(...block);
    }
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
