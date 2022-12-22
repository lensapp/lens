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
import focusWindowInjectable from "./navigation/focus-window.injectable";
import terminalSpawningPoolInjectable from "./components/dock/terminal/terminal-spawning-pool.injectable";
import hostedClusterIdInjectable from "./cluster-frame-context/hosted-cluster-id.injectable";
import lensResourcesDirInjectable from "../common/vars/lens-resources-dir.injectable";
import { runInAction } from "mobx";
import requestAnimationFrameInjectable from "./components/animate/request-animation-frame.injectable";
import getRandomIdInjectable from "../common/utils/get-random-id.injectable";
import platformInjectable from "../common/vars/platform.injectable";
import startTopbarStateSyncInjectable from "./components/layout/top-bar/start-state-sync.injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import watchHistoryStateInjectable from "./remote-helpers/watch-history-state.injectable";
import setupSystemCaInjectable from "./frames/root-frame/setup-system-ca.injectable";
import extensionShouldBeEnabledForClusterFrameInjectable from "./extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import legacyOnChannelListenInjectable from "./ipc/legacy-channel-listen.injectable";
import storageSaveDelayInjectable from "./utils/create-storage/storage-save-delay.injectable";
import environmentVariablesInjectable from "../common/utils/environment-variables.injectable";
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
    instantiate: () => "test",
    injectionToken: nodeEnvInjectionToken,
  }));

  di.preventSideEffects();

  setLegacyGlobalDiForExtensionApi(di, Environments.renderer);

  const injectables: Injectable<any, any, any>[] = (
    global as any
  ).rendererInjectablePaths.flatMap((filePath: string) =>
    Object.values(require(filePath)).filter(
      (maybeInjectable: any) => isInjectable(maybeInjectable),
    ),
  );

  runInAction(() => {
    registerMobX(di);
    di.register(applicationInformationInjectable);

    chunk(100)(injectables).forEach((chunkInjectables) => {
      di.register(...chunkInjectables);
    });
  });

  if (doGeneralOverrides) {
    const globalOverrides: GlobalOverride[] = (global as any).rendererGlobalOverridePaths.map(
      (filePath: string) => require(filePath).default,
    );

    globalOverrides.forEach(globalOverride => {
      di.override(globalOverride.injectable, globalOverride.overridingInstantiate);
    });

    di.override(getRandomIdInjectable, () => () => "some-irrelevant-random-id");
    di.override(platformInjectable, () => "darwin");

    [
      startTopbarStateSyncInjectable,
      setupSystemCaInjectable,
    ].forEach((injectable) => {
      di.override(injectable, () => ({
        id: injectable.id,
        run: () => {},
      }));
    });

    di.override(terminalSpawningPoolInjectable, () => document.createElement("div"));
    di.override(hostedClusterIdInjectable, () => undefined);

    di.override(legacyOnChannelListenInjectable, () => () => noop);

    di.override(storageSaveDelayInjectable, () => 0);

    di.override(requestAnimationFrameInjectable, () => (callback) => callback());
    di.override(lensResourcesDirInjectable, () => "/irrelevant");

    // TODO: Remove after "LensRendererExtension.isEnabledForCluster" is removed
    di.override(extensionShouldBeEnabledForClusterFrameInjectable, () =>
      asyncComputed({ getValueFromObservedPromise: async () => true, valueWhenPending: true }),
    );

    di.override(environmentVariablesInjectable, () => ({}));
    di.override(watchHistoryStateInjectable, () => () => () => {});

    di.override(requestFromChannelInjectable, () => () => Promise.resolve(undefined as never));

    getOverrideFsWithFakes()(di);

    di.override(focusWindowInjectable, () => () => {});
  }

  return di;
};
