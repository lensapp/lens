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

import { observable, when } from "mobx";
import { ClusterId, ClusterStore, getClusterFrameUrl } from "../../../common/cluster-store";
import logger from "../../../main/logger";
import { requestMain } from "../../../common/ipc";
import { clusterVisibilityHandler } from "../../../common/cluster-ipc";

export interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: HTMLIFrameElement
}

export const lensViews = observable.map<ClusterId, LensView>();

export function hasLoadedView(clusterId: ClusterId): boolean {
  return !!lensViews.get(clusterId)?.isLoaded;
}

export async function initView(clusterId: ClusterId) {
  const cluster = ClusterStore.getInstance().getById(clusterId);

  if (!cluster || lensViews.has(clusterId)) {
    return;
  }

  logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
  const parentElem = document.getElementById("lens-views");
  const iframe = document.createElement("iframe");

  iframe.name = cluster.contextName;
  iframe.setAttribute("src", getClusterFrameUrl(clusterId));
  iframe.addEventListener("load", () => {
    logger.info(`[LENS-VIEW]: loaded from ${iframe.src}`);
    lensViews.get(clusterId).isLoaded = true;
  }, { once: true });
  lensViews.set(clusterId, { clusterId, view: iframe });
  parentElem.appendChild(iframe);

  logger.info(`[LENS-VIEW]: waiting cluster to be ready, clusterId=${clusterId}`);

  try {
    await when(() => cluster.ready, { timeout: 5_000 }); // we cannot wait forever because cleanup would be blocked for broken cluster connections
    logger.info(`[LENS-VIEW]: cluster is ready, clusterId=${clusterId}`);
  } finally {
    await autoCleanOnRemove(clusterId, iframe);
  }
}

export async function autoCleanOnRemove(clusterId: ClusterId, iframe: HTMLIFrameElement) {
  await when(() => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    return !cluster || (cluster.disconnected && lensViews.get(clusterId)?.isLoaded);
  });
  logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
  lensViews.delete(clusterId);

  // Keep frame in DOM to avoid possible bugs when same cluster re-created after being removed.
  // In that case for some reasons `webFrame.routingId` returns some previous frameId (usage in app.tsx)
  // Issue: https://github.com/lensapp/lens/issues/811
  iframe.style.display = "none";
  iframe.dataset.meta = `${iframe.name} was removed at ${new Date().toLocaleString()}`;
  iframe.removeAttribute("name");
  iframe.contentWindow.postMessage("teardown", "*");
}

export function refreshViews(visibleClusterId?: string) {
  logger.info(`[LENS-VIEW]: refreshing iframe views, visible cluster id=${visibleClusterId}`);
  const cluster = ClusterStore.getInstance().getById(visibleClusterId);

  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isCurrent = clusterId === cluster?.id;
    const isReady = cluster?.available && cluster?.ready;
    const isVisible = isCurrent && isLoaded && isReady;

    view.style.display = isVisible ? "flex" : "none";

    requestMain(clusterVisibilityHandler, clusterId, isVisible).catch(() => {
      logger.error(`[LENS-VIEW]: failed to set cluster visibility, clusterId=${clusterId}`);
    });
  });
}
