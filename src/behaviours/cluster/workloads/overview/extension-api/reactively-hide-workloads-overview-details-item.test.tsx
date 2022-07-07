/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { IObservableValue } from "mobx";
import { computed, observable, runInAction } from "mobx";
import React from "react";
import navigateToWorkloadsOverviewInjectable from "../../../../../common/front-end-routing/routes/cluster/workloads/overview/navigate-to-workloads-overview.injectable";
import type { ApplicationBuilder } from "../../../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../../../renderer/components/test-utils/get-application-builder";
import { getExtensionFakeFor } from "../../../../../renderer/components/test-utils/get-extension-fake";

describe("reactively hide workloads overview details item", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    const rendererDi = builder.dis.rendererDi;

    builder.setEnvironmentToClusterFrame();

    const getExtensionFake = getExtensionFakeFor(builder);

    someObservable = observable.box(false);

    const testExtension = getExtensionFake({
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        kubeWorkloadsOverviewItems: [
          {
            components: {
              Details: () => (
                <div data-testid="some-workload-overview-detail-item">Some detail component</div>
              ),
            },

            visible: computed(() => someObservable.get()),
          },
        ],
      },
    });

    rendered = await builder.render();

    const navigateToWorkloadsOverview = rendererDi.inject(
      navigateToWorkloadsOverviewInjectable,
    );

    navigateToWorkloadsOverview();

    builder.extensions.enable(testExtension);
  });

  it("does not show the workload overview detail item", () => {
    const actual = rendered.queryByTestId("some-workload-overview-detail-item");

    expect(actual).not.toBeInTheDocument();
  });

  it("given item should be shown, shows the workload overview detail item", () => {
    runInAction(() => {
      someObservable.set(true);
    });

    const actual = rendered.queryByTestId("some-workload-overview-detail-item");

    expect(actual).toBeInTheDocument();
  });
});
