/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { KubeObjectStatusLevel } from "../../../common/k8s-api/kube-object-status";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import React from "react";
import { useFakeTime } from "../../../common/test-utils/use-fake-time";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { IAtom } from "mobx";
import { createAtom, computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../../common/front-end-routing/front-end-route-injection-token";
import { routeSpecificComponentInjectionToken } from "../../../renderer/routes/route-specific-component-injection-token";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
import { observer } from "mobx-react";
import { kubeObjectStatusTextInjectionToken } from "../../../renderer/components/kube-object-status-icon/kube-object-status-text-injection-token";
import { KubeObjectStatusIcon } from "../../../renderer/components/kube-object-status-icon";

describe("show status for a kube object", () => {
  let builder: ApplicationBuilder;
  let infoStatusIsShown: boolean;
  let warningStatusIsShown: boolean;
  let criticalStatusIsShown: boolean;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    infoStatusIsShown = false;

    const infoStatusInjectable = getInjectable({
      id: "some-info-status",
      injectionToken: kubeObjectStatusTextInjectionToken,

      instantiate: () => ({
        apiVersions: ["some-api-version"],
        kind: "some-kind",
        enabled: computed(() => true),

        resolve: (resource) => infoStatusIsShown ? ({
          level: KubeObjectStatusLevel.INFO,
          text: `Some info status for ${resource.getName()}`,
          timestamp: "2015-10-19T07:28:00Z",
        }) : null,
      }),
    });

    warningStatusIsShown = false;

    const warningStatusInjectable = getInjectable({
      id: "some-warning-status",
      injectionToken: kubeObjectStatusTextInjectionToken,

      instantiate: () => ({
        apiVersions: ["some-api-version"],
        kind: "some-kind",
        enabled: computed(() => true),

        resolve: (resource) => warningStatusIsShown ? ({
          level: KubeObjectStatusLevel.WARNING,
          text: `Some warning status for ${resource.getName()}`,
          timestamp: "2015-10-19T07:28:00Z",
        }) : null,
      }),
    });

    criticalStatusIsShown = false;

    const criticalStatusInjectable = getInjectable({
      id: "some-critical-status",
      injectionToken: kubeObjectStatusTextInjectionToken,

      instantiate: () => ({
        apiVersions: ["some-api-version"],
        kind: "some-kind",
        enabled: computed(() => true),

        resolve: (resource) => {
          return criticalStatusIsShown
            ? {
              level: KubeObjectStatusLevel.CRITICAL,
              text: `Some critical status for ${resource.getName()}`,
              timestamp: "2015-10-19T07:28:00Z",
            }
            : null;
        },
      }),
    });

    builder.beforeWindowStart((windowDi) => {
      windowDi.register(
        testRouteInjectable,
        testRouteComponentInjectable,
        infoStatusInjectable,
        warningStatusInjectable,
        criticalStatusInjectable,
        someAtomInjectable,
      );
    });

    builder.setEnvironmentToClusterFrame();
  });

  describe("given application starts and in test page", () => {
    let windowDi: DiContainer;
    let rendered: RenderResult;
    let rerenderParent: () => void;

    beforeEach(async () => {
      rendered = await builder.render();

      windowDi = builder.applicationWindow.only.di;

      const someAtom = windowDi.inject(someAtomInjectable);

      rerenderParent = rerenderParentFor(someAtom);

      const navigateToRoute = windowDi.inject(navigateToRouteInjectionToken);
      const testRoute = windowDi.inject(testRouteInjectable);

      navigateToRoute(testRoute);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show any statuses yet", () => {
      const status = rendered.queryByTestId(
        "kube-object-status-icon-for-some-uid",
      );

      expect(status).not.toBeInTheDocument();
    });

    describe("when status for irrelevant kube object kind emerges", () => {
      beforeEach(() => {
        windowDi.register(statusForIrrelevantKubeObjectKindInjectable);

        rerenderParent();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not show any statuses", () => {
        const status = rendered.queryByTestId(
          "kube-object-status-icon-for-some-uid",
        );

        expect(status).not.toBeInTheDocument();
      });
    });

    describe("when status for irrelevant kube object api version emerges", () => {
      beforeEach(() => {
        windowDi.register(statusForIrrelevantKubeObjectApiVersionInjectable);

        rerenderParent();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not show any statuses", () => {
        const status = rendered.queryByTestId(
          "kube-object-status-icon-for-some-uid",
        );

        expect(status).not.toBeInTheDocument();
      });
    });

    describe("when info status emerges", () => {
      beforeEach(() => {
        infoStatusIsShown = true;

        rerenderParent();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows status", () => {
        const status = rendered.getByTestId(
          "kube-object-status-icon-for-some-uid",
        );

        expect(status).toBeInTheDocument();
      });

      it("show info status", () => {
        const tooltipContent = rendered.getByTestId(
          "tooltip-content-for-kube-object-status-icon-for-some-uid",
        );

        expect(tooltipContent).toHaveTextContent(
          "Some info status for some-name",
        );
      });
    });

    describe("when warning status emerges", () => {
      beforeEach(() => {
        warningStatusIsShown = true;

        rerenderParent();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("show warning status", () => {
        const tooltipContent = rendered.getByTestId(
          "tooltip-content-for-kube-object-status-icon-for-some-uid",
        );

        expect(tooltipContent).toHaveTextContent(
          "Some warning status for some-name",
        );
      });
    });

    describe("when critical status emerges", () => {
      beforeEach(() => {
        criticalStatusIsShown = true;

        rerenderParent();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("show critical status", () => {
        const tooltipContent = rendered.getByTestId(
          "tooltip-content-for-kube-object-status-icon-for-some-uid",
        );

        expect(tooltipContent).toHaveTextContent(
          "Some critical status for some-name",
        );
      });
    });
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

const rerenderParentFor = (atom: IAtom) => () => {
  act(() => {
    atom.reportChanged();
  });
};

const TestComponent = observer(({ someAtom }: { someAtom: IAtom }) => {
  void someAtom.reportObserved();

  return (
    <KubeObjectStatusIcon
      object={getKubeObjectStub("some-kind", "some-api-version")}
    />
  );
});

const testRouteComponentInjectable = getInjectable({
  id: "test-route-component",

  instantiate: (di) => {
    const someAtom = di.inject(someAtomInjectable);

    return {
      route: di.inject(testRouteInjectable),
      Component: () => <TestComponent someAtom={someAtom} />,
    };
  },

  injectionToken: routeSpecificComponentInjectionToken,
});

const someAtomInjectable = getInjectable({
  id: "some-atom",
  instantiate: () => createAtom("some-atom"),
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
      selfLink: "/foo",
    },
  });

const statusForIrrelevantKubeObjectKindInjectable = getInjectable({
  id: "status-for-irrelevant-kube-object-kind",
  injectionToken: kubeObjectStatusTextInjectionToken,

  instantiate: () => ({
    apiVersions: ["some-api-version"],
    kind: "some-other-kind",
    enabled: computed(() => true),

    resolve: () => ({
      level: KubeObjectStatusLevel.INFO,
      text: "irrelevant",
      timestamp: "2015-10-19T07:28:00Z",
    }),
  }),
});

const statusForIrrelevantKubeObjectApiVersionInjectable = getInjectable({
  id: "status-for-irrelevant-kube-object-api-version",
  injectionToken: kubeObjectStatusTextInjectionToken,

  instantiate: () => ({
    apiVersions: ["some-other-api-version"],
    kind: "some-kind",
    enabled: computed(() => true),

    resolve: () => ({
      level: KubeObjectStatusLevel.INFO,
      text: "irrelevant",
      timestamp: "2015-10-19T07:28:00Z",
    }),
  }),
});
