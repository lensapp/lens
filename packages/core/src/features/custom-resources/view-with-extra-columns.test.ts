/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata, KubeObjectScope } from "@k8slens/kube-object";
import { KubeObject, CustomResourceDefinition } from "@k8slens/kube-object";
import type { RenderResult } from "@testing-library/react";
import navigateToCustomResourcesInjectable from "../../common/front-end-routing/routes/cluster/custom-resources/navigate-to-custom-resources.injectable";
import apiManagerInjectable from "../../common/k8s-api/api-manager/manager.injectable";
import type { CustomResourceStore } from "../../common/k8s-api/api-manager/resource.store";
import type { CustomResourceDefinitionStore } from "../../renderer/components/custom-resource-definitions/store";
import customResourceDefinitionStoreInjectable from "../../renderer/components/custom-resource-definitions/store.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("Viewing Custom Resources with extra columns", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let customResourceDefinitionStore: CustomResourceDefinitionStore;
  let customResourceStore: CustomResourceStore<KubeObject<KubeObjectMetadata<KubeObjectScope.Cluster>, void, { someColumn: Record<string, unknown> }>>;
  let customResource: CustomResourceDefinition;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    builder.afterWindowStart(({ windowDi }) => {
      const apiManager = windowDi.inject(apiManagerInjectable);

      customResourceDefinitionStore = windowDi.inject(customResourceDefinitionStoreInjectable);
      customResource = new CustomResourceDefinition({
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

      customResourceDefinitionStore.items.replace([
        customResource,
      ]);

      customResourceStore = apiManager.getStore(customResource.getResourceApiBase()) as typeof customResourceStore;

      customResourceStore.items.replace([
        new KubeObject({
          apiVersion: "/some-group/v1",
          kind: "SomeResource",
          metadata: {
            name: "some-resource",
            selfLink: "/apis/some-group/v1/namespaces/default/some-resources/some-resource",
            uid: "some-uid-2",
            resourceVersion: "1",
          },
          spec: {
            someColumn: {
              "foo": "bar",
            },
          },
        }),
      ]);
    });

    result = await builder.render();

    builder.allowKubeResource({
      group: "/apis/apiextensions.k8s.io/v1",
      apiName: "customresourcedefinitions",
    });

    const windowDi = builder.applicationWindow.only.di;
    const navigateToCustomResources = windowDi.inject(navigateToCustomResourcesInjectable);

    navigateToCustomResources({
      group: "some-group",
      name: "some-resources",
    });
  });

  it("renders", () => {
    expect(result.container).toMatchSnapshot();
  });

  it("shows the table for the custom resource SomeResource", () => {
    expect(result.getByText("SomeResource")).toBeInTheDocument();
  });

  it("shows the 'some-column' column", () => {
    expect(result.getByTestId("custom-resource-column-title-some-column")).toBeInTheDocument();
  });

  it("shows some value for in the cells of 'some-column' column", () => {
    expect(result.getByTestId("custom-resource-column-cell-some-column-for-some-resource")).toHaveTextContent(JSON.stringify({ foo: "bar" }));
  });
});
