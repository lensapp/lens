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

describe("Crds", () => {
  describe("getVersion", () => {
    it("should throw if none of the versions are served", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
        },
        spec: {
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
            },
          ],
        },
      });

      expect(() => crd.getVersion()).toThrowError("Failed to find a version for CustomResourceDefinition foo");
    });

    it("should should get the version that is both served and stored", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
        },
        spec: {
          versions: [
            {
              name: "123",
              served: true,
              storage: true,
            },
            {
              name: "1234",
              served: false,
              storage: false,
            },
          ],
        },
      });

      expect(crd.getVersion()).toBe("123");
    });

    it("should should get the version that is both served and stored even with version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
        },
        spec: {
          version: "abc",
          versions: [
            {
              name: "123",
              served: true,
              storage: true,
            },
            {
              name: "1234",
              served: false,
              storage: false,
            },
          ],
        },
      });

      expect(crd.getVersion()).toBe("123");
    });

    it("should get the version name from the version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1beta1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
        },
        spec: {
          version: "abc",
        },
      });

      expect(crd.getVersion()).toBe("abc");
    });
  });
});
