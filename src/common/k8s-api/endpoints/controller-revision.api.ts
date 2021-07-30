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
import { WorkloadKubeObject } from "../workload-kube-object";
import { autoBind } from "../../utils/autobind";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export class ControllerRevisionApi extends KubeApi<ControllerRevision> {

  async getRevisions(params: { namespace: string; name: string }) {
    return await this.list({ namespace: params.namespace }, { labelSelector: `name=${params.name}` });
  }
}

export class ControllerRevision extends WorkloadKubeObject {
  static kind = "ControllerRevision";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/controllerrevisions";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  declare revision: number;
  declare data: string;

  getRevisionNumber() {
    return this.revision;
  }
}

export const controllerRevisionApi = new ControllerRevisionApi({
  objectConstructor: ControllerRevision,
});
