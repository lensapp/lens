/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable, when } from "mobx";
import type { ClusterId } from "../../../common/cluster-types";
import type { Disposer } from "@k8slens/utilities";
import { onceDefined } from "@k8slens/utilities";
import assert from "assert";
import type { Logger } from "@k8slens/logger";
import { getClusterFrameUrl } from "../../../common/utils";
import type { GetClusterById } from "../../../features/cluster/storage/common/get-by-id.injectable";

export interface LensView {
  isLoaded: boolean;
  frame: HTMLIFrameElement;
}

interface Dependencies {
  readonly logger: Logger;
  getClusterById: GetClusterById;
  emitClusterVisibility: (clusterId: ClusterId | null) => void;
}

export class ClusterFrameHandler {
  private readonly views = observable.map<string, LensView>();

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);
  }

  public hasLoadedView(clusterId: string): boolean {
    return Boolean(this.views.get(clusterId)?.isLoaded);
  }

  @action
  public initView(clusterId: ClusterId) {
    const cluster = this.dependencies.getClusterById(clusterId);

    if (!cluster) {
      this.dependencies.logger.warn(`[LENS-VIEW]: not initializing view; unknown clusterId="${clusterId}"`);

      return;
    }

    const parentElem = document.getElementById("lens-views");

    assert(parentElem, "DOM with #lens-views must be present");

    if (this.views.has(clusterId)) {
      return;
    }

    this.dependencies.logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
    const iframe = document.createElement("iframe");

    iframe.id = `cluster-frame-${cluster.id}`;
    iframe.name = cluster.contextName.get();
    iframe.setAttribute("src", getClusterFrameUrl(clusterId));
    iframe.addEventListener("load", action(() => {
      this.dependencies.logger.info(`[LENS-VIEW]: frame for clusterId=${clusterId} has loaded`);
      const view = this.views.get(clusterId);

      assert(view, `view for ${clusterId} MUST still exist here`);
      view.isLoaded = true;
    }), { once: true });
    this.views.set(clusterId, { frame: iframe, isLoaded: false });
    parentElem.appendChild(iframe);

    this.dependencies.logger.info(`[LENS-VIEW]: waiting cluster to be ready, clusterId=${clusterId}`);

    const dispose = when(
      () => cluster.ready.get(),
      () => this.dependencies.logger.info(`[LENS-VIEW]: cluster is ready, clusterId=${clusterId}`),
    );

    when(
      // cluster.disconnect is set to `false` when the cluster starts to connect
      () => !cluster.disconnected.get(),
      () => {
        when(
          () => {
            const cluster = this.dependencies.getClusterById(clusterId);

            return Boolean(!cluster || (cluster.disconnected.get() && this.views.get(clusterId)?.isLoaded));
          },
          () => {
            this.dependencies.logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
            this.views.delete(clusterId);

            // Must only remove iframe from DOM after it unloads old code. Else it crashes
            iframe.addEventListener("load", () => parentElem.removeChild(iframe), {
              once: true,
            });

            // This causes the old code to be unloaded.
            iframe.setAttribute("src", "");

            dispose();
          },
        );
      },
    );
  }

  private prevVisibleClusterChange?: Disposer;

  public setVisibleCluster(clusterId: ClusterId | null): void {
    // Clear the previous when ASAP
    this.prevVisibleClusterChange?.();

    this.dependencies.logger.info(`[LENS-VIEW]: refreshing iframe views, visible cluster id=${clusterId}`);
    this.dependencies.emitClusterVisibility(null);

    for (const { frame: view } of this.views.values()) {
      view.classList.add("hidden");
    }

    const cluster = clusterId
      ? this.dependencies.getClusterById(clusterId)
      : undefined;

    if (cluster && clusterId) {
      this.prevVisibleClusterChange = onceDefined(
        () => {
          const view = this.views.get(clusterId);

          if (cluster.available.get() && cluster.ready.get() && view?.isLoaded) {
            return view;
          }

          return undefined;
        },
        (view: LensView) => {
          this.dependencies.logger.info(`[LENS-VIEW]: cluster id=${clusterId} should now be visible`);
          view.frame.classList.remove("hidden");
          view.frame.focus();
          this.dependencies.emitClusterVisibility(clusterId);
        },
      );
    }
  }

  public clearVisibleCluster() {
    this.setVisibleCluster(null);
  }
}
