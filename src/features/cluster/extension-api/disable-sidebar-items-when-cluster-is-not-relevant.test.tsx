/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import React from "react";
import extensionShouldBeEnabledForClusterFrameInjectable from "../../../renderer/extension-loader/extension-should-be-enabled-for-cluster-frame.injectable";

describe("disable sidebar items when cluster is not relevant", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
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

        clusterPageMenus: [
          {
            id: "some-sidebar-item",
            title: "Some sidebar item",

            components: {
              Icon: () => <div>Some icon</div>,
            },
          },
        ],
      },
    };

    rendered = await builder.render();

    builder.extensions.enable(testExtension);
  });

  describe("given not yet known if extension should be enabled for the cluster", () => {
    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the sidebar item", () => {
      const actual = rendered.queryByTestId(
        "sidebar-item-some-extension-name-some-sidebar-item",
      );

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

    it("does not show the sidebar item", () => {
      const actual = rendered.queryByTestId(
        "sidebar-item-some-extension-name-some-sidebar-item",
      );

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

    it("shows the sidebar item", () => {
      const actual = rendered.getByTestId(
        "sidebar-item-test-extension-some-sidebar-item",
      );

      expect(actual).toBeInTheDocument();
    });
  });
});
