/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import isEmpty from "lodash/isEmpty";
import queryParametersInjectable from "../renderer/routes/query-parameters.injectable";
import currentPathInjectable from "../renderer/routes/current-path.injectable";
import type { IComputedValue } from "mobx";
import { getApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import type { FakeExtensionOptions } from "../renderer/components/test-utils/get-extension-fake";
import type { LensRendererExtension } from "../extensions/lens-renderer-extension";

describe("navigate to extension page", () => {
  let rendered: RenderResult;
  let testExtension: LensRendererExtension;
  let queryParameters: IComputedValue<object>;
  let currentPath: IComputedValue<string>;

  beforeEach(async () => {
    const builder = getApplicationBuilder();

    builder.extensions.enable(extensionWithPagesHavingParameters);

    rendered = await builder.render();

    const windowDi = builder.applicationWindow.only.di;

    testExtension =
      builder.extensions.get("some-extension-id").applicationWindows.only;

    queryParameters = windowDi.inject(queryParametersInjectable);
    currentPath = windowDi.inject(currentPathInjectable);
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  describe("when extension navigates to route without parameters", () => {
    beforeEach(() => {
      testExtension.navigate();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("URL is correct", () => {
      expect(currentPath.get()).toBe("/extension/some-extension-name");
    });

    it("query parameters is empty", () => {
      expect(queryParameters.get()).toEqual({});
    });

    describe("when changing page parameters", () => {
      beforeEach(() => {
        const button = rendered.getByTestId("button-to-change-page-parameters");

        fireEvent.click(button);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("URL is correct", () => {
        expect(currentPath.get()).toBe("/extension/some-extension-name");
      });

      it("knows query parameters", () => {
        expect(queryParameters.get()).toEqual({
          someStringParameter: "some-changed-string-value",
          someNumberParameter: "84",
          someArrayParameter:
            "some-changed-array-value,some-other-changed-array-value",
        });
      });
    });
  });

  describe("when extension navigates to route with parameters", () => {
    beforeEach(() => {
      testExtension.navigate(undefined, {
        someStringParameter: "some-string-value-from-navigate",
        someNumberParameter: 126,
        someArrayParameter: ["some-array-value-from-navigate"],
      });
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("URL is correct", () => {
      expect(currentPath.get()).toBe("/extension/some-extension-name");
    });

    it("knows query parameters", () => {
      expect(queryParameters.get()).toEqual({
        someStringParameter: "some-string-value-from-navigate",
        someNumberParameter: "126",
        someArrayParameter: "some-array-value-from-navigate",
      });
    });
  });

  describe("when extension navigates to child route", () => {
    beforeEach(() => {
      testExtension.navigate("some-child-page-id");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("URL is correct", () => {
      expect(currentPath.get()).toBe("/extension/some-extension-name/some-child-page-id");
    });
  });
});

const extensionWithPagesHavingParameters: FakeExtensionOptions = {
  id: "some-extension-id",
  name: "some-extension-name",

  rendererOptions: {
    globalPages: [
      {
        components: {
          Page: ({ params }) => (
            <div>
              <ul>
                <li>{params.someStringParameter.get()}</li>
                <li>{params.someNumberParameter.get()}</li>
                <li>{params.someArrayParameter.get().join(",")}</li>
              </ul>

              <button
                type="button"
                data-testid="button-to-change-page-parameters"
                onClick={() => {
                  params.someStringParameter.set("some-changed-string-value");
                  params.someNumberParameter.set(84);
                  params.someArrayParameter.set([
                    "some-changed-array-value",
                    "some-other-changed-array-value",
                  ]);
                }}
              >
                Some button
              </button>
            </div>
          ),
        },

        params: {
          someStringParameter: "some-string-value",
          someNumberParameter: {
            defaultValue: 42,
            stringify: (value) => value.toString(),
            parse: (value) => (value ? Number(value) : undefined),
          },
          someArrayParameter: {
            defaultValue: ["some-array-value", "some-other-array-value"],
            stringify: (value) => value.join(","),
            parse: (value: string[]) => (!isEmpty(value) ? value : undefined),
          },
        },
      },
      {
        id: "some-child-page-id",
        components: {
          Page: () => <div>Child page</div>,
        },
      },
    ],
  },
};
