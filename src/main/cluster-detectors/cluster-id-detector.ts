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

import { BaseClusterDetector } from "./base-cluster-detector";
import { createHash } from "crypto";
import { ClusterMetadataKey } from "../cluster";

export class ClusterIdDetector extends BaseClusterDetector {
  key = ClusterMetadataKey.CLUSTER_ID;

  public async detect() {
    let id: string;

    try {
      id = await this.getDefaultNamespaceId();
    } catch(_) {
      id = this.cluster.apiUrl;
    }
    const value = createHash("sha256").update(id).digest("hex");

    return { value, accuracy: 100 };
  }

  protected async getDefaultNamespaceId() {
    const response = await this.k8sRequest("/api/v1/namespaces/default");

    return response.metadata.uid;
  }
}
