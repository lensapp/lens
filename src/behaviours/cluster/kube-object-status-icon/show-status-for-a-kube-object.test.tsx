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
import type { IObservableValue } from "mobx";
import { observable, computed, runInAction } from "mobx";
import { KubeObjectStatusIcon } from "../../../renderer/components/kube-object-status-icon";
import { kubeObjectStatusTextInjectionToken } from "../../../renderer/components/kube-object-status-icon/kube-object-status-text-injection-token";
import { frontEndRouteInjectionToken } from "../../../common/front-end-routing/front-end-route-injection-token";
import { routeSpecificComponentInjectionToken } from "../../../renderer/routes/route-specific-component-injection-token";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import type { RenderResult } from "@testing-library/react";

// TODO: Make tooltips free of side effects by making it deterministic
jest.mock("../../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip:
    (Target: any) =>
      ({ tooltip, ...props }: any) => {
        if (tooltip) {
          const testId = props["data-testid"];

          return (
            <>
              <Target tooltip={tooltip.children ? undefined : tooltip} {...props} />
              <div data-testid={testId && `tooltip-content-for-${testId}`}>{tooltip.children || tooltip}</div>
            </>
          );
        }

        return <Target {...props} />;
      },
}));

describe("show status for a kube object", () => {
  let builder: ApplicationBuilder;
  let infoStatusIsShown: IObservableValue<boolean>;
  let warningStatusIsShown: IObservableValue<boolean>;
  let criticalStatusIsShown: IObservableValue<boolean>;

  beforeEach(() => {
    useFakeTime("2015-10-21T07:28:00Z");

    builder = getApplicationBuilder();

    const rendererDi = builder.dis.rendererDi;

    infoStatusIsShown = observable.box(false);
    warningStatusIsShown = observable.box(false);
    criticalStatusIsShown = observable.box(false);

    const infoStatusInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.INFO,
      "info",
      "some-kind",
      ["some-api-version"],
      infoStatusIsShown,
    );

    const warningStatusInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.WARNING,
      "warning",
      "some-kind",
      ["some-api-version"],
      warningStatusIsShown,
    );

    const criticalStatusInjectable = getStatusTextInjectable(
      KubeObjectStatusLevel.CRITICAL,
      "critical",
      "some-kind",
      ["some-api-version"],
      criticalStatusIsShown,
    );

    rendererDi.register(
      testRouteInjectable,
      testRouteComponentInjectable,
      infoStatusInjectable,
      warningStatusInjectable,
      criticalStatusInjectable,
    );

    builder.setEnvironmentToClusterFrame();
  });

  describe("given application starts and in test page", () => {
    let rendererDi: DiContainer;
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await builder.render();

      rendererDi = builder.dis.rendererDi;

      const navigateToRoute = rendererDi.inject(navigateToRouteInjectionToken);
      const testRoute = rendererDi.inject(testRouteInjectable);

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
        rendererDi.register(statusForIrrelevantKubeObjectKindInjectable);
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
        rendererDi.register(statusForIrrelevantKubeObjectApiVersionInjectable);
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
        runInAction(() => {
          infoStatusIsShown.set(true);
        });
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

        expect(tooltipContent).toHaveTextContent("Some info status for some-name");
      });
    });

    describe("when warning status emerges", () => {
      beforeEach(() => {
        warningStatusIsShown.set(true);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("show warning status", () => {
        const tooltipContent = rendered.getByTestId(
          "tooltip-content-for-kube-object-status-icon-for-some-uid",
        );

        expect(tooltipContent).toHaveTextContent("Some warning status for some-name");
      });
    });

    describe("when critical status emerges", () => {
      beforeEach(() => {
        criticalStatusIsShown.set(true);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("show critical status", () => {
        const tooltipContent = rendered.getByTestId(
          "tooltip-content-for-kube-object-status-icon-for-some-uid",
        );

        expect(tooltipContent).toHaveTextContent("Some critical status for some-name");
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

const getKubeObjectStub = (kind: string, apiVersion: string) => KubeObject.create({
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

const getStatusTextInjectable = (
  level: KubeObjectStatusLevel,
  title: string,
  kind: string,
  apiVersions: string[],
  statusIsShown?: IObservableValue<boolean>,
) =>
  getInjectable({
    id: title,

    instantiate: () => ({
      apiVersions,
      kind,

      resolve: (kubeObject: KubeObject) => {
        if (statusIsShown && !statusIsShown.get()) {
          return null;
        }

        return {
          level,
          text: `Some ${title} status for ${kubeObject.getName()}`,
          timestamp: "2015-10-19T07:28:00Z",
        };
      },

      enabled: computed(() => true),
    }),

    injectionToken: kubeObjectStatusTextInjectionToken,
  });

const statusForIrrelevantKubeObjectKindInjectable = getStatusTextInjectable(
  KubeObjectStatusLevel.INFO,
  "irrelevant",
  "some-other-kind",
  ["some-api-version"],
);

const statusForIrrelevantKubeObjectApiVersionInjectable = getStatusTextInjectable(
  KubeObjectStatusLevel.INFO,
  "irrelevant",
  "some-kind",
  ["some-other-api-version"],
);
