/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getInjectable } from "@ogre-tools/injectable";
import { frontEndRouteInjectionToken } from "../../../../common/front-end-routing/front-end-route-injection-token";
import type { IObservableValue } from "mobx";
import { runInAction, computed, observable } from "mobx";
import React from "react";
import { navigateToRouteInjectionToken } from "../../../../common/front-end-routing/navigate-to-route-injection-token";
import { routeSpecificComponentInjectionToken } from "../../../../renderer/routes/route-specific-component-injection-token";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager/manager.injectable";
import { KubeObjectDetails } from "../../../../renderer/components/kube-object-details";
import type { ApiManager } from "../../../../common/k8s-api/api-manager";

describe("reactively hide kube object detail item", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(
        apiManagerInjectable,
        () =>
          ({
            getStore: () => ({
              getByPath: () =>
                getKubeObjectStub("some-kind", "some-api-version"),
            }),
          } as unknown as ApiManager),
      );

      windowDi.register(testRouteInjectable, testRouteComponentInjectable);
    });

    someObservable = observable.box(false);

    const testExtension = {
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

    const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);
    const testRoute = windowDi.inject(testRouteInjectable);

    navigateToRoute(testRoute);

    builder.extensions.enable(testExtension);
  });

  it("does not show the kube object detail item", () => {
    const actual = rendered.queryByTestId("some-kube-object-detail-item");

    expect(actual).not.toBeInTheDocument();
  });

  it("given item should be shown, shows the kube object detail item", () => {
    runInAction(() => {
      someObservable.set(true);
    });

    const actual = rendered.queryByTestId("some-kube-object-detail-item");

    expect(actual).toBeInTheDocument();
  });
});

const testRouteInjectable = getInjectable({
  id: "test-route",

  instantiate: () => ({
    path: "/test-route",
    clusterFrame: true,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

const testRouteComponentInjectable = getInjectable({
  id: "test-route-component",

  instantiate: (di) => ({
    route: di.inject(testRouteInjectable),

    Component: () => <KubeObjectDetails />,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
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
