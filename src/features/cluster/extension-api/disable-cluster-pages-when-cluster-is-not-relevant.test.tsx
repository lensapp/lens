/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { TestExtensionRenderer } from "../../../renderer/components/test-utils/get-extension-fake";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import React from "react";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../renderer/extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";

describe("disable-cluster-pages-when-cluster-is-not-relevant", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let rendererTestExtension: TestExtensionRenderer;
  let isEnabledForClusterMock: AsyncFnMock<(cluster: KubernetesCluster) => Promise<boolean>>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart((windowDi) => {
      windowDi.unoverride(extensionShouldBeEnabledForClusterFrameInjectable);
    });

    isEnabledForClusterMock = asyncFn();

    const testExtension = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        isEnabledForCluster: isEnabledForClusterMock,

        clusterPages: [{
          components: {
            Page: () => <div data-testid="some-test-page">Some page</div>,
          },
        }],
      },
    };

    rendered = await builder.render();

    builder.extensions.enable(testExtension);

    rendererTestExtension =
      builder.extensions.get("test-extension-id").applicationWindows.only;
  });

  describe("given not yet known if extension should be enabled for the cluster, when navigating", () => {
    beforeEach(() => {
      rendererTestExtension.navigate();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the page", () => {
      const actual = rendered.queryByTestId("some-test-page");

      expect(actual).not.toBeInTheDocument();
    });
  });

  describe("given extension shouldn't be enabled for the cluster, when navigating", () => {
    beforeEach(async () => {
      await isEnabledForClusterMock.resolve(false);

      rendererTestExtension.navigate();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the page", () => {
      const actual = rendered.queryByTestId("some-test-page");

      expect(actual).not.toBeInTheDocument();
    });
  });

  describe("given extension should be enabled for the cluster, when navigating", () => {
    beforeEach(async () => {
      await isEnabledForClusterMock.resolve(true);

      rendererTestExtension.navigate();
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows the page", () => {
      const actual = rendered.getByTestId("some-test-page");

      expect(actual).toBeInTheDocument();
    });
  });
});
