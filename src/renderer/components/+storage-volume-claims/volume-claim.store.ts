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
import { KubeObjectStore } from "../../kube-object.store";
import { autobind } from "../../utils";
import { IPvcMetrics, PersistentVolumeClaim, pvcApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

@autobind()
export class VolumeClaimStore extends KubeObjectStore<PersistentVolumeClaim> {
  api = pvcApi;
  @observable metrics: IPvcMetrics = null;

  @action
  async loadMetrics(pvc: PersistentVolumeClaim) {
    this.metrics = await pvcApi.getMetrics(pvc.getName(), pvc.getNs());
  }

  reset() {
    this.metrics = null;
  }
}

export const volumeClaimStore = new VolumeClaimStore();
apiManager.registerStore(volumeClaimStore);
