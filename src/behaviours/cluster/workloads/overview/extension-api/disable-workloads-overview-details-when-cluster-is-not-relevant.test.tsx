/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../../../renderer/components/test-utils/get-application-builder";
import type { KubernetesCluster } from "../../../../../common/catalog-entities";
import { getApplicationBuilder } from "../../../../../renderer/components/test-utils/get-application-builder";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../../../renderer/extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";
import apiManagerInjectable from "../../../../../common/k8s-api/api-manager/manager.injectable";
import navigateToWorkloadsOverviewInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/overview/navigate-to-workloads-overview.injectable";
import React from "react";

describe("disable workloads overview details when cluster is not relevant", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let isEnabledForClusterMock: AsyncFnMock<
    (cluster: KubernetesCluster) => Promise<boolean>
  >;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeApplicationStart((mainDi) => {
      mainDi.override(apiManagerInjectable, () => ({}));
    });

    builder.beforeWindowStart((windowDi) => {
      windowDi.unoverride(extensionShouldBeEnabledForClusterFrameInjectable);
    });

    isEnabledForClusterMock = asyncFn();

    const testExtension = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        isEnabledForCluster: isEnabledForClusterMock,

        kubeWorkloadsOverviewItems: [
          {
            components: {
              Details: () => (
                <div data-testid="some-detail-component">Some detail component</div>
              ),
            },
          },
        ],
      },
    };

    rendered = await builder.render();

    const windowDi = builder.applicationWindow.only.di;

    const navigateToWorkloadsOverview = windowDi.inject(
      navigateToWorkloadsOverviewInjectable,
    );

    navigateToWorkloadsOverview();

    builder.extensions.enable(testExtension);
  });

  describe("given not yet known if extension should be enabled for the cluster", () => {
    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the detail", () => {
      const actual = rendered.queryByTestId("some-detail-component");

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

    it("does not show the detail", () => {
      const actual = rendered.queryByTestId("some-detail-component");

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

    it("shows the detail", () => {
      const actual = rendered.getByTestId("some-detail-component");

      expect(actual).toBeInTheDocument();
    });
  });
});
