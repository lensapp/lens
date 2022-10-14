/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import type { KubernetesCluster } from "../../../../common/catalog-entities";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import React from "react";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import type { KubeApi } from "../../../../common/k8s-api/kube-api";
import showDetailsInjectable from "../../../../renderer/components/kube-detail-params/show-details.injectable";

describe("disable kube object detail items when cluster is not relevant", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let isEnabledForClusterMock: AsyncFnMock<
    (cluster: KubernetesCluster) => Promise<boolean>
  >;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    builder.afterWindowStart((windowDi) => {
      const apiManager = windowDi.inject(apiManagerInjectable);
      const api = {
        apiBase: "/apis/some-api-version/some-kind",
      } as Partial<KubeApi<KubeObject>> as KubeApi<KubeObject>;
      const store = {
        api,
        loadFromPath: async () => getKubeObjectStub("some-kind", "some-api-version"),
      } as Partial<KubeObjectStore<KubeObject>> as KubeObjectStore<KubeObject>;

      apiManager.registerApi(api);
      apiManager.registerStore(store);
    });

    isEnabledForClusterMock = asyncFn();

    const testExtension = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        isEnabledForCluster: isEnabledForClusterMock,

        kubeObjectDetailItems: [
          {
            kind: "some-kind",
            apiVersions: ["some-api-version"],
            components: {
              Details: () => (
                <div data-testid="some-kube-object-detail-item">
                  Some detail
                </div>
              ),
            },
          },
        ],
      },
    };

    rendered = await builder.render();

    const windowDi = builder.applicationWindow.only.di;
    const showDetails = windowDi.inject(showDetailsInjectable);

    showDetails("/apis/some-api-version/namespaces/some-namespace/some-kind/some-name");

    builder.extensions.enable(testExtension);
  });

  afterEach(() => {
    builder.quit();
  });

  describe("given not yet known if extension should be enabled for the cluster", () => {
    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the kube object detail item", () => {
      const actual = rendered.queryByTestId("some-kube-object-detail-item");

      expect(actual).not.toBeInTheDocument();
    });
  });

  describe("given extension shouldn't be enabled for the cluster", () => {
    beforeEach(async () => {
      await isEnabledForClusterMock.resolve(false);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the kube object detail item", () => {
      const actual = rendered.queryByTestId("some-kube-object-detail-item");

      expect(actual).not.toBeInTheDocument();
    });
  });

  describe("given extension should be enabled for the cluster", () => {
    beforeEach(async () => {
      await isEnabledForClusterMock.resolve(true);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows the kube object detail item", () => {
      const actual = rendered.getByTestId("some-kube-object-detail-item");

      expect(actual).toBeInTheDocument();
    });
  });
});

const getKubeObjectStub = (kind: string, apiVersion: string) =>
  KubeObject.create({
    apiVersion,
    kind,
    metadata: {
      uid: "some-uid",
      name: "some-name",
      resourceVersion: "some-resource-version",
      namespace: "some-namespace",
      selfLink: "",
    },
  });
