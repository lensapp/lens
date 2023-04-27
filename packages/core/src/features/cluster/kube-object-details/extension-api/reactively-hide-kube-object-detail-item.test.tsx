/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import type { IObservableValue } from "mobx";
import { runInAction, computed, observable } from "mobx";
import React from "react";
import { KubeObject } from "@k8slens/kube-object";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import type { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import type { KubeApi } from "../../../../common/k8s-api/kube-api";
import showDetailsInjectable from "../../../../renderer/components/kube-detail-params/show-details.injectable";
import assert from "assert";
import type { FakeExtensionOptions } from "../../../../renderer/components/test-utils/get-extension-fake";

describe("reactively hide kube object detail item", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.afterWindowStart(({ windowDi }) => {
      const apiManager = windowDi.inject(apiManagerInjectable);
      const api = {
        apiBase: "/apis/some-api-version/some-kind",
      } as Partial<KubeApi<KubeObject>> as KubeApi<KubeObject>;
      const store = {
        api,
        loadFromPath: async () => Promise.resolve(getKubeObjectStub("some-kind", "some-api-version")),
        getByPath() {
        },
      } as Partial<KubeObjectStore<KubeObject>> as KubeObjectStore<KubeObject>;

      apiManager.registerApi(api);
      apiManager.registerStore(store);
    });

    someObservable = observable.box(false);

    const testExtension: FakeExtensionOptions = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
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

            visible: computed(() => someObservable.get()),
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

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  it("does not show the kube object detail item", () => {
    const actual = rendered.queryByTestId("some-kube-object-detail-item");

    expect(actual).not.toBeInTheDocument();
  });

  describe("when the item is shown", () => {
    beforeEach(() => {
      runInAction(() => {
        someObservable.set(true);
      });

      const apiManager = builder.applicationWindow.only.di.inject(apiManagerInjectable);

      assert(apiManager.getStore("/apis/some-api-version/some-kind"));
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows the kube object detail item", () => {
      const actual = rendered.queryByTestId("some-kube-object-detail-item");

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
