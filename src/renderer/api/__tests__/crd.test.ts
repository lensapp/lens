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

import { CustomResourceDefinition } from "../endpoints";
import type { KubeObjectMetadata } from "../kube-object";

describe("Crds", () => {
  describe("getVersion", () => {
    it("should get the first version name from the list of versions", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as KubeObjectMetadata,
      });

      crd.spec = {
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the list of versions (length 2)", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as KubeObjectMetadata,
      });

      crd.spec = {
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          },
          {
            name: "1234",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the list of versions (length 2) even with version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as KubeObjectMetadata,
      });

      crd.spec = {
        version: "abc",
        versions: [
          {
            name: "123",
            served: false,
            storage: false,
          },
          {
            name: "1234",
            served: false,
            storage: false,
          }
        ]
      } as any;

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the first version name from the version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "foo",
        kind: "CustomResourceDefinition",
        metadata: {} as KubeObjectMetadata,
      });

      crd.spec = {
        version: "abc"
      } as any;

      expect(crd.getVersion()).toBe("abc");
    });
  });
});
