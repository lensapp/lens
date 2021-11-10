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

import { action, IReactionDisposer, makeObservable, observable, when } from "mobx";
import logger from "../../../common/logger";
import { clusterVisibilityHandler } from "../../../common/cluster-ipc";
import { ClusterStore } from "../../../common/cluster-store";
import type { ClusterId } from "../../../common/cluster-types";
import { getClusterFrameUrl, Singleton } from "../../utils";
import { ipcRenderer } from "electron";

export interface LensView {
  isLoaded: boolean;
  frame: HTMLIFrameElement;
}

export class ClusterFrameHandler extends Singleton {
  private views = observable.map<string, LensView>();

  constructor() {
    super();
    makeObservable(this);
  }

  public hasLoadedView(clusterId: string): boolean {
    return Boolean(this.views.get(clusterId)?.isLoaded);
  }

  @action
  public initView(clusterId: ClusterId) {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (!cluster || this.views.has(clusterId)) {
      return;
    }

    logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
    const parentElem = document.getElementById("lens-views");
    const iframe = document.createElement("iframe");

    iframe.id = `cluster-frame-${cluster.id}`;
    iframe.name = cluster.contextName;
    iframe.style.display = "none";
    iframe.setAttribute("src", getClusterFrameUrl(clusterId));
    iframe.addEventListener("load", () => {
      logger.info(`[LENS-VIEW]: loaded from ${iframe.src}`);
      this.views.get(clusterId).isLoaded = true;
    }, { once: true });
    this.views.set(clusterId, { frame: iframe, isLoaded: false });
    parentElem.appendChild(iframe);

    logger.info(`[LENS-VIEW]: waiting cluster to be ready, clusterId=${clusterId}`);

    const dispose = when(
      () => cluster.ready,
      () => logger.info(`[LENS-VIEW]: cluster is ready, clusterId=${clusterId}`),
    );

    when(
      // cluster.disconnect is set to `false` when the cluster starts to connect
      () => !cluster.disconnected,
      () => {
        when(
          () => {
            const cluster = ClusterStore.getInstance().getById(clusterId);

            return !cluster || (cluster.disconnected && this.views.get(clusterId)?.isLoaded);
          },
          () => {
            logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
            this.views.delete(clusterId);
            iframe.parentNode.removeChild(iframe);
            dispose();
          },
        );
      },
    );
  }

  private prevVisibleClusterChange?: IReactionDisposer;

  public setVisibleCluster(clusterId: ClusterId | null) {
    // Clear the previous when ASAP
    this.prevVisibleClusterChange?.();

    logger.info(`[LENS-VIEW]: refreshing iframe views, visible cluster id=${clusterId}`);
    ipcRenderer.send(clusterVisibilityHandler);

    for (const { frame: view } of this.views.values()) {
      view.style.display = "none";
    }

    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (cluster) {
      this.prevVisibleClusterChange = when(
        () => cluster.available && cluster.ready && this.views.get(clusterId)?.isLoaded,
        () => {
          logger.info(`[LENS-VIEW]: cluster id=${clusterId} should now be visible`);
          this.views.get(clusterId).frame.style.display = "flex";
          ipcRenderer.send(clusterVisibilityHandler, clusterId);
        },
      );
    }
  }

  public clearVisibleCluster() {
    this.setVisibleCluster(null);
  }
}
