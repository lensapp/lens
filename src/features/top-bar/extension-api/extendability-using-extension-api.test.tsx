/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";

import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../../../renderer/components/test-utils/get-extension-fake";

describe("extendability-using-extension-api", () => {
  let rendered: RenderResult;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  it("given an extension with top-bar items has not been enabled yet, does not render the top-bar item", () => {
    expect(rendered.queryByTestId("some-top-bar-item")).not.toBeInTheDocument();
  });

  describe("given an extension with top-bar items is enabled", () => {
    let testExtension: FakeExtensionOptions;

    beforeEach(() => {
      testExtension = {
        id: "test-extension",
        name: "Test Extension",

        rendererOptions: {
          topBarItems: [
            {
              components: {
                Item: () => (
                  <div data-testid="some-top-bar-item">Some-content</div>
                ),
              },
            },
          ],
        },
      };

      applicationBuilder.extensions.enable(testExtension);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders the top-bar item", () => {
      expect(rendered.getByTestId("some-top-bar-item")).toBeInTheDocument();
    });

    describe("when the extension is disabled", () => {
      beforeEach(() => {
        applicationBuilder.extensions.disable(testExtension);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("no longer renders the top-bar item", () => {
        expect(rendered.queryByTestId("some-top-bar-item")).not.toBeInTheDocument();
      });
    });
  });

  describe("given an extension with a weakly typed and invalid top-bar item is enabled", () => {
    beforeEach(() => {
      const testExtension: FakeExtensionOptions = {
        id: "test-extension",
        name: "Test Extension",

        rendererOptions: {
          topBarItems: [
            {
              components: {
                // Note: this makes the item invalid.
                Item: undefined,
              },
            } as any,

            // Note: empty object makes the item invalid.
            {} as any,

            // Note: non-object makes the item invalid.
            undefined as any,
          ],
        },
      };

      applicationBuilder.extensions.enable(testExtension);
    });

    it("renders without blowing up", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });
  });
});
