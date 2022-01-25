/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { delay } from "../../../../common/utils";
import { broadcastMessage, BundledExtensionsLoaded } from "../../../../common/ipc";
import { registerIpcListeners } from "../../../ipc";
import logger from "../../../../common/logger";
import { unmountComponentAtNode } from "react-dom";
import type { ExtensionLoading } from "../../../../extensions/extension-loader";
import type { CatalogEntityRegistry } from "../../../api/catalog-entity-registry";
import type { BundledExtensionsUpdater } from "../../../components/+extensions/extension-updater/bundled-extensions-updater";

interface Dependencies {
  loadExtensions: () => Promise<ExtensionLoading[]>;

  // TODO: Move usages of third party library behind abstraction
  ipcRenderer: { send: (name: string) => void };

  // TODO: Remove dependencies being here only for correct timing of initialization
  bindProtocolAddRouteHandlers: () => void;
  lensProtocolRouterRenderer: { init: () => void };
  catalogEntityRegistry: CatalogEntityRegistry;

  bundledExtensionsUpdater: BundledExtensionsUpdater;
}

const logPrefix = "[ROOT-FRAME]:";

export const initRootFrame =
  ({
    loadExtensions,
    bindProtocolAddRouteHandlers,
    lensProtocolRouterRenderer,
    ipcRenderer,
    catalogEntityRegistry,
    bundledExtensionsUpdater,
  }: Dependencies) =>
    async (rootElem: HTMLElement) => {
      catalogEntityRegistry.init();
      bundledExtensionsUpdater.init();

      try {
      // maximum time to let bundled extensions finish loading
        const timeout = delay(10000);

        const loadingExtensions = await loadExtensions();

        const loadingBundledExtensions = loadingExtensions
          .filter((e) => e.isBundled)
          .map((e) => e.loaded);

        const bundledExtensionsFinished = Promise.all(loadingBundledExtensions);

        await Promise.race([bundledExtensionsFinished, timeout]);
      } finally {
        ipcRenderer.send(BundledExtensionsLoaded);
      }

      lensProtocolRouterRenderer.init();

      bindProtocolAddRouteHandlers();

      window.addEventListener("offline", () =>
        broadcastMessage("network:offline"),
      );

      window.addEventListener("online", () => broadcastMessage("network:online"));

      registerIpcListeners();

      window.addEventListener("beforeunload", () => {
        logger.info(`${logPrefix} Unload app`);

        unmountComponentAtNode(rootElem);
      });
    };
