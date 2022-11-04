/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
import type { IObservableValue } from "mobx";
import { computed, observable, runInAction } from "mobx";
import React from "react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("legacy extension adding cluster frame components", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(() => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();
  });

  describe("given custom components for cluster view available", () => {
    let someObservable: IObservableValue<boolean>;

    beforeEach(async () => {
      someObservable = observable.box(false);

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension-name",

        rendererOptions: {
          clusterFrameComponents: [
            {
              id: "test-modal-id",
              Component: () => <div data-testid="test-modal">test modal</div>,
              shouldRender: computed(() => true),
            },
            {
              id: "dialog-with-observable-visibility-id",
              Component: () => <div data-testid="dialog-with-observable-visibility">dialog contents</div>,
              shouldRender: computed(() => someObservable.get()),
            },
          ],
        },
      };

      rendered = await builder.render();
      builder.extensions.enable(testExtension);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("renders provided component html", () => {
      const modal = rendered.getByTestId("test-modal");

      expect(modal).toBeInTheDocument();
    });

    it("doesn't render component which should be invisible", () => {
      const dialog = rendered.queryByTestId("dialog-with-observable-visibility");

      expect(dialog).not.toBeInTheDocument();
    });

    it("when injectable component becomes visible, shows it", () => {
      runInAction(() => {
        act(() => someObservable.set(true));
      });

      const dialog = rendered.getByTestId("dialog-with-observable-visibility");

      expect(dialog).toBeInTheDocument();
    });
  });
});
