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
import type { CatalogEntityRegistry } from "../../../catalog/entity-registry";
import { injectSystemCAs } from "../../../../common/system-ca";
import type { Cluster } from "../../../../common/cluster/cluster";

interface Dependencies {
  loadExtensions: () => Promise<ExtensionLoading[]>;

  // TODO: Move usages of third party library behind abstraction
  ipcRenderer: { send: (name: string) => void };

  // TODO: Remove dependencies being here only for correct timing of initialization
  bindProtocolAddRouteHandlers: () => void;
  lensProtocolRouterRenderer: { init: () => void };
  catalogEntityRegistry: CatalogEntityRegistry;
  getClusterById: (clusterId: string) => Cluster | null;
}

const logPrefix = "[ROOT-FRAME]:";

export async function initRootFrame(
  { loadExtensions, bindProtocolAddRouteHandlers, lensProtocolRouterRenderer, ipcRenderer, catalogEntityRegistry, getClusterById }: Dependencies,
  rootElem: HTMLElement,
) {
  injectSystemCAs();
  catalogEntityRegistry.init();

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

  window.addEventListener("offline", () => broadcastMessage("network:offline"),
  );

  window.addEventListener("online", () => broadcastMessage("network:online"));

  registerIpcListeners({ getClusterById });

  window.addEventListener("beforeunload", () => {
    logger.info(`${logPrefix} Unload app`);

    unmountComponentAtNode(rootElem);
  });
}
