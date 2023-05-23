/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import { CustomResourceDefinition } from "../../extensions/common-api/k8s-api";
import type { CustomResourceDefinitionStore } from "../../renderer/components/custom-resources/definition.store";
import customResourceDefinitionStoreInjectable from "../../renderer/components/custom-resources/definition.store.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("cluster - custom resources in sidebar", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let customResourceDefinitionStore: CustomResourceDefinitionStore;
  let customResourceDefinition: CustomResourceDefinition;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    builder.afterWindowStart(({ windowDi }) => {
      customResourceDefinitionStore = windowDi.inject(customResourceDefinitionStoreInjectable);
      customResourceDefinition = new CustomResourceDefinition({
        apiVersion: "apiextensions.k8s.io/v1",
        kind: "CustomResourceDefinition",
        metadata: {
          name: "some-crd",
          selfLink: "/apis/apiextensions.k8s.io/v1/customresourcedefinitions/some-crd",
          uid: "some-uid",
          resourceVersion: "1",
        },
        spec: {
          group: "some-group",
          scope: "Cluster",
          names: {
            kind: "SomeResource",
            plural: "some-resources",
            singular: "some-resource",
          },
          versions: [
            {
              storage: true,
              name: "v1",
              served: true,
              additionalPrinterColumns: [
                {
                  name: "Some Column",
                  type: "string",
                  description: "Some description",
                  jsonPath: ".spec.someColumn",
                },
              ],
            },
          ],
        },
      });
    });

    result = await builder.render();
  });

  it("renders", () => {
    expect(result.container).toMatchSnapshot();
  });

  it("shows the sidebar", () => {
    expect(result.getByTestId("cluster-sidebar")).toBeInTheDocument();
  });

  it("does not show Custom Resources section", () => {
    expect(result.queryByTestId("sidebar-item-custom-resources")).not.toBeInTheDocument();
  });

  describe("when custom resource exists", () => {
    beforeEach(() => {
      customResourceDefinitionStore.items.replace([
        customResourceDefinition,
      ]);
    });

    it("renders", () => {
      expect(result.container).toMatchSnapshot();
    });

    it("still does not show Custom Resources sidebar", () => {
      expect(result.queryByTestId("sidebar-item-custom-resources")).not.toBeInTheDocument();
    });

    describe("when specific custom resource is an allowed resource", () => {
      beforeEach(() => {
        builder.allowKubeResource({
          apiName: "some-resources",
          group: "some-group",
        });
      });

      it("renders", () => {
        expect(result.container).toMatchSnapshot();
      });

      it("shows Custom Resources sidebar", () => {
        expect(result.getByTestId("sidebar-item-custom-resources")).toBeInTheDocument();
      });

      it("shows Custom Resources sidebar as expandable", () => {
        expect(result.getByTestId("sidebar-item-expand-icon-for-custom-resources")).toBeInTheDocument();
      });

      it("does not show SomeResources sidebar", () => {
        expect(result.queryByTestId("sidebar-item-custom-resource-group-some-group")).not.toBeInTheDocument();
      });

      it("does not show Custom Resources Definitions sidebar", () => {
        expect(result.queryByTestId("sidebar-item-custom-resource-definitions")).not.toBeInTheDocument();
      });

      describe("when custom resources sidebar item is expanded", () => {
        beforeEach(() => {
          result.getByTestId("sidebar-item-expand-icon-for-custom-resources").click();
        });

        it("renders", () => {
          expect(result.container).toMatchSnapshot();
        });

        it("shows Custom Resources sidebar", () => {
          expect(result.getByTestId("sidebar-item-custom-resources")).toBeInTheDocument();
        });

        it("shows Custom Resources sidebar as expandable", () => {
          expect(result.getByTestId("sidebar-item-expand-icon-for-custom-resources")).toBeInTheDocument();
        });

        it("shows some-group group sidebar item", () => {
          expect(result.getByTestId("sidebar-item-custom-resource-group-some-group")).toBeInTheDocument();
        });

        it("does not show Custom Resources Definitions sidebar", () => {
          expect(result.queryByTestId("sidebar-item-custom-resource-definitions")).not.toBeInTheDocument();
        });

        describe("when custom resources group sidebar item is expanded", () => {
          beforeEach(() => {
            result.getByTestId("sidebar-item-expand-icon-for-custom-resource-group-some-group").click();
          });

          it("renders", () => {
            expect(result.container).toMatchSnapshot();
          });

          it("shows some-group group sidebar item", () => {
            expect(result.getByTestId("sidebar-item-custom-resource-group-some-group")).toBeInTheDocument();
          });

          it("shows some-resources group sidebar item", () => {
            expect(result.getByTestId("sidebar-item-custom-resource-group-some-group/some-resources")).toBeInTheDocument();
          });
        });
      });
    });

    describe("when custom resource definitions are an allowed resource", () => {
      beforeEach(() => {
        builder.allowKubeResource({
          apiName: "customresourcedefinitions",
          group: "apiextensions.k8s.io",
        });
      });

      it("renders", () => {
        expect(result.container).toMatchSnapshot();
      });

      it("shows Custom Resources sidebar", () => {
        expect(result.getByTestId("sidebar-item-custom-resources")).toBeInTheDocument();
      });

      it("shows Custom Resources sidebar as expandable", () => {
        expect(result.getByTestId("sidebar-item-expand-icon-for-custom-resources")).toBeInTheDocument();
      });

      it("does not show SomeResources sidebar", () => {
        expect(result.queryByTestId("sidebar-item-custom-resource-group-some-group")).not.toBeInTheDocument();
      });

      it("does not show Custom Resources Definitions sidebar", () => {
        expect(result.queryByTestId("sidebar-item-custom-resource-definitions")).not.toBeInTheDocument();
      });

      describe("when custom resources sidebar item is expanded", () => {
        beforeEach(() => {
          result.getByTestId("sidebar-item-expand-icon-for-custom-resources").click();
        });

        it("renders", () => {
          expect(result.container).toMatchSnapshot();
        });

        it("shows Custom Resources sidebar", () => {
          expect(result.getByTestId("sidebar-item-custom-resources")).toBeInTheDocument();
        });

        it("shows Custom Resources sidebar as expandable", () => {
          expect(result.getByTestId("sidebar-item-expand-icon-for-custom-resources")).toBeInTheDocument();
        });

        it("does not show SomeResources sidebar", () => {
          expect(result.queryByTestId("sidebar-item-custom-resource-group-some-group")).not.toBeInTheDocument();
        });

        it("shows Custom Resources Definitions sidebar", () => {
          expect(result.getByTestId("sidebar-item-custom-resource-definitions")).toBeInTheDocument();
        });
      });
    });
  });

  describe("when custom resource definitions are an allowed resource", () => {
    beforeEach(() => {
      builder.allowKubeResource({
        apiName: "customresourcedefinitions",
        group: "apiextensions.k8s.io",
      });
    });

    it("renders", () => {
      expect(result.container).toMatchSnapshot();
    });

    it("shows Custom Resources sidebar", () => {
      expect(result.getByTestId("sidebar-item-custom-resources")).toBeInTheDocument();
    });

    it("shows Custom Resources sidebar as expandable", () => {
      expect(result.getByTestId("sidebar-item-expand-icon-for-custom-resources")).toBeInTheDocument();
    });

    it("does not show Custom Resources Definitions sidebar", () => {
      expect(result.queryByTestId("sidebar-item-custom-resource-definitions")).not.toBeInTheDocument();
    });
  });
});
