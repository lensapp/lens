/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { CustomResourceDefinition } from "@k8slens/kube-object";
import { KubeObject } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import { CustomResourceDetails } from "../crd-resource-details";

describe("<CustomResourceDetails />", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
  });

  describe("with a CRD with a boolean field", () => {
    let crd: CustomResourceDefinition;

    beforeEach(() => {
      crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "my-crd",
          resourceVersion: "1",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/my-crd",
          uid: "1",
        },
        spec: {
          versions: [{
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      "my-field": {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
            additionalPrinterColumns: [
              {
                name: "MyField",
                jsonPath: ".spec.my-field",
                type: "boolean",
              },
            ],
          }],
          group: "stable.lens.dev",
          names: {
            kind: "MyCrd",
            plural: "my-crds",
          },
          scope: "Cluster",
        },
      });
    });

    it("should display false in an additionalPrinterColumn as 'false'", () => {
      const cr = new KubeObject({
        apiVersion: "stable.lens.dev/v1",
        kind: "MyCrd",
        metadata: {
          name: "first-crd",
          resourceVersion: "1",
          selfLink: "stable.lens.dev/v1/first-crd",
          uid: "2",
        },
        spec: {
          "my-field": false,
        },
      });
      const result = render(<CustomResourceDetails crd={crd} object={cr} />);

      expect(result.container).toMatchSnapshot();
      expect(result.getByText("false")).toBeTruthy();
    });

    it("should display true in an additionalPrinterColumn as 'true'", () => {
      const cr = new KubeObject({
        apiVersion: "stable.lens.dev/v1",
        kind: "MyCrd",
        metadata: {
          name: "first-crd",
          resourceVersion: "1",
          selfLink: "stable.lens.dev/v1/first-crd",
          uid: "2",
        },
        spec: {
          "my-field": true,
        },
      });
      const result = render(<CustomResourceDetails crd={crd} object={cr} />);

      expect(result.container).toMatchSnapshot();
      expect(result.getByText("true")).toBeTruthy();
    });
  });

  describe("with a CRD with a number field", () => {
    let crd: CustomResourceDefinition;

    beforeEach(() => {
      crd = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "my-crd",
          resourceVersion: "1",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/my-crd",
          uid: "1",
        },
        spec: {
          versions: [{
            name: "v1",
            served: true,
            storage: true,
            schema: {
              openAPIV3Schema: {
                type: "object",
                properties: {
                  spec: {
                    type: "object",
                    properties: {
                      "my-field": {
                        type: "number",
                      },
                    },
                  },
                },
              },
            },
            additionalPrinterColumns: [
              {
                name: "MyField",
                jsonPath: ".spec.my-field",
                type: "number",
              },
            ],
          }],
          group: "stable.lens.dev",
          names: {
            kind: "MyCrd",
            plural: "my-crds",
          },
          scope: "Cluster",
        },
      });
    });

    it("should display 0 in an additionalPrinterColumn as '0'", () => {
      const cr = new KubeObject({
        apiVersion: "stable.lens.dev/v1",
        kind: "MyCrd",
        metadata: {
          name: "first-crd",
          resourceVersion: "1",
          selfLink: "stable.lens.dev/v1/first-crd",
          uid: "2",
        },
        spec: {
          "my-field": 0,
        },
      });
      const result = render(<CustomResourceDetails crd={crd} object={cr} />);

      expect(result.container).toMatchSnapshot();
      expect(result.getByText("0")).toBeTruthy();
    });

    it("should display 1234 in an additionalPrinterColumn as '1234'", () => {
      const cr = new KubeObject({
        apiVersion: "stable.lens.dev/v1",
        kind: "MyCrd",
        metadata: {
          name: "first-crd",
          resourceVersion: "1",
          selfLink: "stable.lens.dev/v1/first-crd",
          uid: "2",
        },
        spec: {
          "my-field": 1234,
        },
      });
      const result = render(<CustomResourceDetails crd={crd} object={cr} />);

      expect(result.container).toMatchSnapshot();
      expect(result.getByText("1234")).toBeTruthy();
    });
  });
});
