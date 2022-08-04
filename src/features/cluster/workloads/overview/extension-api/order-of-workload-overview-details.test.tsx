/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import { getApplicationBuilder } from "../../../../../renderer/components/test-utils/get-application-builder";
import React from "react";
import getRandomIdInjectable from "../../../../../common/utils/get-random-id.injectable";
import { workloadOverviewDetailInjectionToken } from "../../../../../renderer/components/+workloads-overview/workload-overview-details/workload-overview-detail-injection-token";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

describe("order of workload overview details", () => {
  let rendered: RenderResult;

  beforeEach(async () => {
    const builder = getApplicationBuilder();

    builder.beforeWindowStart((windowDi) => {
      windowDi.unoverride(getRandomIdInjectable);
      windowDi.permitSideEffects(getRandomIdInjectable);

      windowDi.register(
        someCoreItemWithLowOrderNumberInjectable,
        someCoreItemWithHighOrderNumberInjectable,
        someCoreItemWithDefaultOrderNumberInjectable,
      );
    });

    builder.setEnvironmentToClusterFrame();

    rendered = await builder.render();

    const testExtension = {
      id: "some-extension-id",
      name: "some-extension",

      rendererOptions: {
        kubeWorkloadsOverviewItems: [
          {
            components: {
              Details: () => (
                <div
                  data-testid="workload-overview-detail"
                  id="some-extension-item-without-priority"
                />
              ),
            },
          },
          {
            priority: 70,
            components: {
              Details: () => (
                <div
                  data-testid="workload-overview-detail"
                  id="some-extension-item-with-high-priority"
                />
              ),
            },
          },
          {
            priority: 10,
            components: {
              Details: () => (
                <div
                  data-testid="workload-overview-detail"
                  id="some-extension-item-with-low-priority"
                />
              ),
            },
          },
        ],
      },
    };

    builder.extensions.enable(testExtension);
  });

  it("shows items in correct order", () => {
    const actual = rendered.queryAllByTestId("workload-overview-detail").map(x => x.id);

    expect(actual).toEqual([
      "some-core-item-with-low-order-number",
      "some-extension-item-with-high-priority",
      "some-core-item-with-default-order-number",
      "some-extension-item-without-priority",
      "some-core-item-with-high-order-number",
      "some-extension-item-with-low-priority",
    ]);
  });
});

const someCoreItemWithLowOrderNumberInjectable = getInjectable({
  id: "some-core-item-with-low-order-number",

  instantiate: () => ({
    orderNumber: 30,
    enabled: computed(() => true),

    Component: () => (
      <div
        data-testid="workload-overview-detail"
        id="some-core-item-with-low-order-number"
      />
    ),
  }),

  injectionToken: workloadOverviewDetailInjectionToken,
});

const someCoreItemWithDefaultOrderNumberInjectable = getInjectable({
  id: "some-core-item-with-default-order-number",

  instantiate: () => ({
    orderNumber: 50,
    enabled: computed(() => true),

    Component: () => (
      <div
        data-testid="workload-overview-detail"
        id="some-core-item-with-default-order-number"
      />
    ),
  }),

  injectionToken: workloadOverviewDetailInjectionToken,
});

const someCoreItemWithHighOrderNumberInjectable = getInjectable({
  id: "some-core-item-high-order-number",

  instantiate: () => ({
    orderNumber: 60,
    enabled: computed(() => true),

    Component: () => (
      <div
        data-testid="workload-overview-detail"
        id="some-core-item-with-high-order-number"
      />
    ),
  }),

  injectionToken: workloadOverviewDetailInjectionToken,
});
