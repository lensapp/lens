/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../renderer/components/test-utils/get-application-builder";
import { getExtensionFakeFor } from "../../../../renderer/components/test-utils/get-extension-fake";
import { getInjectable } from "@ogre-tools/injectable";
import { frontEndRouteInjectionToken } from "../../../../common/front-end-routing/front-end-route-injection-token";
import type { IObservableValue } from "mobx";
import { observable, runInAction, computed } from "mobx";
import React from "react";
import { navigateToRouteInjectionToken } from "../../../../common/front-end-routing/navigate-to-route-injection-token";
import { routeSpecificComponentInjectionToken } from "../../../../renderer/routes/route-specific-component-injection-token";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../../renderer/extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import { KubeObjectStatusLevel } from "../../../../common/k8s-api/kube-object-status";
import { KubeObjectStatusIcon } from "../../../../renderer/components/kube-object-status-icon";

describe("reactively hide kube object status", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    const rendererDi = builder.dis.rendererDi;

    rendererDi.unoverride(extensionShouldBeEnabledForClusterFrameInjectable);

    rendererDi.register(testRouteInjectable, testRouteComponentInjectable);

    builder.setEnvironmentToClusterFrame();

    const getExtensionFake = getExtensionFakeFor(builder);

    someObservable = observable.box(false);

    const testExtension = getExtensionFake({
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        kubeObjectStatusTexts: [
          {
            kind: "some-kind",
            apiVersions: ["some-api-version"],

            resolve: () => ({
              level: KubeObjectStatusLevel.CRITICAL,
              text: "some-kube-object-status-text",
            }),

            visible: computed(() => someObservable.get()),
          },
        ],
      },
    });

    rendered = await builder.render();

    const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);
    const testRoute = rendererDi.inject(testRouteInjectable);

    navigateToRoute(testRoute);

    builder.extensions.enable(testExtension);
  });

  it("does not show the kube object status", () => {
    const actual = rendered.baseElement.querySelectorAll(
      ".KubeObjectStatusIcon",
    );

    expect(actual).toHaveLength(0);
  });

  it("given item should be shown, shows the kube object status", () => {
    runInAction(() => {
      someObservable.set(true);
    });

    const actual = rendered.baseElement.querySelectorAll(
      ".KubeObjectStatusIcon",
    );

    expect(actual).toHaveLength(1);
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
      <KubeObjectStatusIcon
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
