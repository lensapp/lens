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
import { observable, runInAction, computed } from "mobx";
import React from "react";
import { navigateToRouteInjectionToken } from "../../../../common/front-end-routing/navigate-to-route-injection-token";
import { routeSpecificComponentInjectionToken } from "../../../../renderer/routes/route-specific-component-injection-token";
import { KubeObject } from "@k8slens/kube-object";
import { KubeObjectMenu } from "../../../../renderer/components/kube-object-menu";

describe("reactively hide kube object menu item", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart(({ windowDi }) => {
      runInAction(() => {
        windowDi.register(testRouteInjectable, testRouteComponentInjectable);
      });
    });

    someObservable = observable.box(false);

    const testExtension = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        kubeObjectMenuItems: [
          {
            kind: "some-kind",
            apiVersions: ["some-api-version"],
            components: {
              MenuItem: () => (
                <div data-testid="some-kube-object-menu-item">Some menu item</div>
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

  it("does not show the kube object menu item", () => {
    const actual = rendered.queryByTestId("some-kube-object-menu-item");

    expect(actual).not.toBeInTheDocument();
  });

  it("given item should be shown, shows the kube object menu item", () => {
    runInAction(() => {
      someObservable.set(true);
    });

    const actual = rendered.queryByTestId("some-kube-object-menu-item");

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

    Component: () => (
      <KubeObjectMenu
        toolbar={true}
        object={getKubeObjectStub("some-kind", "some-api-version")}
      />
    ),
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

