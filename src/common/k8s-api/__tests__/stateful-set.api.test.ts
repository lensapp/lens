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

import { StatefulSet, StatefulSetApi } from "../endpoints/stateful-set.api";
import type { KubeJsonApi } from "../kube-json-api";

class StatefulSetApiTest extends StatefulSetApi {
  public setRequest(request: any) {
    this.request = request;
  }
}

describe("StatefulSetApi", () => {
  describe("scale", () => {
    const requestMock = {
      patch: () => ({}),
    } as unknown as KubeJsonApi;

    const sub = new StatefulSetApiTest({ objectConstructor: StatefulSet });

    sub.setRequest(requestMock);

    it("requests Kubernetes API with PATCH verb and correct amount of replicas", () => {
      const patchSpy = jest.spyOn(requestMock, "patch");

      sub.scale({ namespace: "default", name: "statefulset-1" }, 5);

      expect(patchSpy).toHaveBeenCalledWith("/apis/apps/v1/namespaces/default/statefulsets/statefulset-1/scale", {
        data: {
          spec: {
            replicas: 5,
          },
        },
      },
      {
        headers: {
          "content-type": "application/merge-patch+json",
        },
      });
    });
  });
});
