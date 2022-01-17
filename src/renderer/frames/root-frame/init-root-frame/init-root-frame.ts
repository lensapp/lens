/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { delay } from "../../../../common/utils";
import { broadcastMessage, BundledExtensionsLoaded } from "../../../../common/ipc";
import { registerIpcListeners } from "../../../ipc";
import logger from "../../../../common/logger";
import { unmountComponentAtNode } from "react-dom";
import type { ExtensionLoading } from "../../../../extensions/extension-loader";
import type { CatalogEntityRegistry } from "../../../api/catalog-entity-registry";

interface Dependencies {
  loadExtensions: () => ExtensionLoading[]

  // TODO: Move usages of third party library behind abstraction
  ipcRenderer: { send: (name: string) => void }

  // TODO: Remove dependencies being here only for correct timing of initialization
  bindProtocolAddRouteHandlers: () => void;
  lensProtocolRouterRenderer: { init: () => void };
  catalogEntityRegistry: CatalogEntityRegistry
}

const logPrefix = "[ROOT-FRAME]:";

export const initRootFrame =
  ({
    loadExtensions,
    bindProtocolAddRouteHandlers,
    lensProtocolRouterRenderer,
    ipcRenderer,

    catalogEntityRegistry,
  }: Dependencies) =>
    async (rootElem: HTMLElement) => {
      catalogEntityRegistry.init();

      try {
      // maximum time to let bundled extensions finish loading
        const timeout = delay(10000);

        const loadingExtensions = loadExtensions();

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
