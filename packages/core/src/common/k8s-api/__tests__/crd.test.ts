/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CustomResourceDefinitionSpec } from "../endpoints";
import { CustomResourceDefinition } from "../endpoints";

describe("Crds", () => {
  describe("getVersion()", () => {
    it("should throw if none of the versions are served", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/foo",
        },
        spec: {
          group: "foo.bar",
          names: {
            kind: "Foo",
            plural: "foos",
          },
          scope: "Namespaced",
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

    it("should get the version that is both served and stored", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/foo",
        },
        spec: {
          group: "foo.bar",
          names: {
            kind: "Foo",
            plural: "foos",
          },
          scope: "Namespaced",
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

    it("should get the version that is only stored", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/foo",
        },
        spec: {
          group: "foo.bar",
          names: {
            kind: "Foo",
            plural: "foos",
          },
          scope: "Namespaced",
          versions: [
            {
              name: "123",
              served: false,
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

    it("should get the version that is both served and stored even with version field", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/foo",
        },
        spec: {
          group: "foo.bar",
          names: {
            kind: "Foo",
            plural: "foos",
          },
          scope: "Namespaced",
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

    it("should get the version name from the version field, ignoring versions on v1beta", () => {
      const crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1beta1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "foo",
          resourceVersion: "12345",
          uid: "12345",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/foo",
        },
        spec: {
          version: "abc",
          versions: [
            {
              name: "foobar",
              served: true,
              storage: true,
            },
          ],
        } as CustomResourceDefinitionSpec,
      });

      expect(crd.getVersion()).toBe("abc");
    });
  });
});
