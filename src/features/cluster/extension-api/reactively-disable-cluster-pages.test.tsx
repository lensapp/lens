/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { IObservableValue } from "mobx";
import { observable, runInAction, computed } from "mobx";
import React from "react";
import type { TestExtensionRenderer } from "../../../renderer/components/test-utils/get-extension-fake";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";

describe("reactively disable cluster pages", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let someObservable: IObservableValue<boolean>;
  let testExtensionInstance: TestExtensionRenderer;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    someObservable = observable.box(false);

    const testExtensionOptions = {
      id: "test-extension-id",
      name: "test-extension",

      rendererOptions: {
        clusterPages: [{
          components: {
            Page: () => <div data-testid="some-test-page">Some page</div>,
          },

          enabled: computed(() => someObservable.get()),
        }],
      },
    };

    rendered = await builder.render();

    builder.extensions.enable(testExtensionOptions);

    testExtensionInstance =
      builder.extensions.get("test-extension-id").applicationWindows.only;
  });

  it("when navigating to the page, does not show the page", () => {
    testExtensionInstance.navigate();

    const actual = rendered.queryByTestId("some-test-page");

    expect(actual).not.toBeInTheDocument();
  });

  it("given page becomes enabled, when navigating to the page, shows the page", () => {
    runInAction(() => {
      someObservable.set(true);
    });

    testExtensionInstance.navigate();

    const actual = rendered.queryByTestId("some-test-page");

    expect(actual).toBeInTheDocument();
  });
});
