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

import AwaitLock from "await-lock";
import { action, observable } from "mobx";
import type { ClusterId } from "./cluster-store";
import { iter, Singleton } from "./utils";

export interface ClusterFrameInfo {
  frameId: number;
  processId: number;
  windowId: number;
}

export class ClusterFrames extends Singleton {
  /**
   * The current set of frame info for each cluster
   */
  private frames = observable.map<ClusterId, ClusterFrameInfo>();

  /**
   * The current mapping of clusters to the window that hope to create an iframe
   *
   * Used to make sure that if two windows try and open the same cluster, the one
   * locks and submits a claim first is the only one.
   */
  private claims = observable.map<ClusterId, number>();
  private claimsLock = new AwaitLock();

  public getAllFrameInfo(): ClusterFrameInfo[] {
    return [...this.frames.values()];
  }

  public getClusterIdFromFrameInfo(query: ClusterFrameInfo): ClusterId | undefined {
    for (const [clusterId, info] of this.frames) {
      if (
        info.frameId === query.frameId
        && info.processId === query.processId
        && info.windowId === query.windowId
      ) {
        return clusterId;
      }
    }

    return undefined;
  }

  @action
  public set(clusterId: ClusterId, info: ClusterFrameInfo): void {
    if (!this.claims.has(clusterId)) {
      throw new Error("Cannot set a cluster's FrameInfo if no claim exists");
    }

    if (this.claims.get(clusterId) !== info.windowId) {
      throw new Error("Cannot set a cluster's FrameInfo for a window that didn't previously claim the cluster");
    }

    this.frames.set(clusterId, info);
    this.claims.delete(clusterId);
  }

  /**
   * Attempts to claim cluster for window. Will succeed if previously claimed by the same window
   * @param clusterId The cluster to claim for a particular window
   * @param windowId The ID of the window trying to claim it
   * @returns `true` if that window now has a claim, otherwise `false`
   */
  public async claimCluster(clusterId: ClusterId, windowId: number): Promise<boolean> {
    try {
      await this.claimsLock.acquireAsync();

      if (this.claims.get(clusterId) === windowId) {
        return true;
      }

      if (this.frames.get(clusterId)?.windowId === windowId) {
        return true;
      }

      if (this.claims.has(clusterId) || this.frames.has(clusterId)) {
        return false;
      }

      this.claims.set(clusterId, windowId);

      return true;
    } finally {
      this.claimsLock.release();
    }
  }

  public getFrameInfoByClusterId(clusterId: ClusterId): ClusterFrameInfo | undefined {
    return this.frames.get(clusterId);
  }

  public getFrameInfoByFrameId(frameId: number): ClusterFrameInfo | undefined {
    return iter.find(this.frames.values(), frameInfo => frameInfo.frameId === frameId);
  }

  public clearInfoForCluster(clusterId: ClusterId): void {
    this.frames.delete(clusterId);
    this.claims.delete(clusterId);
  }

  @action
  public clearInfoForWindow(windowId: number): void {
    for (const [clusterId, frameInfo] of this.frames) {
      if (frameInfo.windowId === windowId) {
        this.frames.delete(clusterId);
      }
    }

    for (const [clusterId, windowIdClaim] of this.claims) {
      if (windowIdClaim === windowId) {
        this.claims.delete(clusterId);
      }
    }
  }
}
