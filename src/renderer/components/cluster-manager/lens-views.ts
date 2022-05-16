/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable, when } from "mobx";
import logger from "../../../main/logger";
import { clusterVisibilityHandler } from "../../../common/ipc/cluster";
import { ClusterStore } from "../../../common/cluster-store/cluster-store";
import type { ClusterId } from "../../../common/cluster-types";
import type { Disposer } from "../../utils";
import { getClusterFrameUrl, onceDefined } from "../../utils";
import { ipcRenderer } from "electron";
import assert from "assert";

export interface LensView {
  isLoaded: boolean;
  frame: HTMLIFrameElement;
}

export class ClusterFrameHandler {
  private readonly views = observable.map<string, LensView>();

  constructor() {
    makeObservable(this);
  }

  public hasLoadedView(clusterId: string): boolean {
    return Boolean(this.views.get(clusterId)?.isLoaded);
  }

  @action
  public initView(clusterId: ClusterId) {
    const cluster = ClusterStore.getInstance().getById(clusterId);
    const parentElem = document.getElementById("lens-views");

    assert(parentElem, "DOM with #lens-views must be present");

    if (!cluster || this.views.has(clusterId)) {
      return;
    }

    logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
    const iframe = document.createElement("iframe");

    iframe.id = `cluster-frame-${cluster.id}`;
    iframe.name = cluster.contextName;
    iframe.style.display = "none";
    iframe.setAttribute("src", getClusterFrameUrl(clusterId));
    iframe.addEventListener("load", action(() => {
      logger.info(`[LENS-VIEW]: frame for clusterId=${clusterId} has loaded`);
      const view = this.views.get(clusterId);

      assert(view, `view for ${clusterId} MUST still exist here`);
      view.isLoaded = true;
    }), { once: true });
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

            return Boolean(!cluster || (cluster.disconnected && this.views.get(clusterId)?.isLoaded));
          },
          () => {
            logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
            this.views.delete(clusterId);
            parentElem.removeChild(iframe);
            dispose();
          },
        );
      },
    );
  }

  private prevVisibleClusterChange?: Disposer;

  public setVisibleCluster(clusterId: ClusterId | null) {
    // Clear the previous when ASAP
    this.prevVisibleClusterChange?.();

    logger.info(`[LENS-VIEW]: refreshing iframe views, visible cluster id=${clusterId}`);
    ipcRenderer.send(clusterVisibilityHandler);

    for (const { frame: view } of this.views.values()) {
      view.style.display = "none";
    }

    const cluster = clusterId
      ? ClusterStore.getInstance().getById(clusterId)
      : undefined;

    if (cluster && clusterId) {
      this.prevVisibleClusterChange = onceDefined(
        () => {
          const view = this.views.get(clusterId);

          if (cluster.available && cluster.ready && view?.isLoaded) {
            return view;
          }

          return undefined;
        },
        (view) => {
          logger.info(`[LENS-VIEW]: cluster id=${clusterId} should now be visible`);
          view.frame.style.display = "flex";
          ipcRenderer.send(clusterVisibilityHandler, clusterId);
        },
      );
    }
  }

  public clearVisibleCluster() {
    this.setVisibleCluster(null);
  }
}
