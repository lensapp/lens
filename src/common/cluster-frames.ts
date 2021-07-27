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

import { action, observable } from "mobx";
import type { ClusterId } from "./cluster-store";
import { iter, Singleton } from "./utils";

export interface ClusterFrameInfo {
  frameId: number;
  processId: number;
  windowId: number;
}

export class ClusterFrames extends Singleton {
  private mapping = observable.map<ClusterId, ClusterFrameInfo>();

  public getAllFrameInfo(): ClusterFrameInfo[] {
    return [...this.mapping.values()];
  }

  public set(clusterId: ClusterId, info: ClusterFrameInfo): void {
    this.mapping.set(clusterId, info);
  }

  public getFrameInfoByClusterId(clusterId: ClusterId): ClusterFrameInfo | undefined {
    return this.mapping.get(clusterId);
  }

  public getFrameInfoByFrameId(frameId: number): ClusterFrameInfo | undefined {
    return iter.find(this.mapping.values(), frameInfo => frameInfo.frameId === frameId);
  }

  public clearInfoForCluster(clusterId: ClusterId): void {
    this.mapping.delete(clusterId);
  }

  @action
  public clearInfoForWindow(windowId: number): void {
    for (const [clusterId, frameInfo] of this.mapping) {
      if (frameInfo.windowId === windowId) {
        this.mapping.delete(clusterId);
      }
    }
  }
}
