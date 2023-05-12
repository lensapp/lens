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
import { act } from "react-dom/test-utils";

describe("disable sidebar items when cluster is not relevant", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let isEnabledForClusterMock: AsyncFnMock<(cluster: KubernetesCluster) => Promise<boolean>>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

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
            id: "sidebar-item-some",
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
      expect(rendered.queryByTestId("sidebar-item-test-extension-sidebar-item-some")).not.toBeInTheDocument();
    });
  });

  describe("given extension shouldn't be enabled for the cluster", () => {
    beforeEach(async () => {
      await act(async () => {
        await isEnabledForClusterMock.resolve(false);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("does not show the sidebar item", () => {
      expect(rendered.queryByTestId("sidebar-item-test-extension-sidebar-item-some")).not.toBeInTheDocument();
    });
  });

  describe("given extension should be enabled for the cluster", () => {
    beforeEach(async () => {
      await act(async () => {
        await isEnabledForClusterMock.resolve(true);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows the sidebar item", () => {
      expect(rendered.getByTestId("sidebar-item-test-extension-sidebar-item-some")).toBeInTheDocument();
    });
  });
});
