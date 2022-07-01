/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import React from "react";
import type { GetRendererExtensionFake, TestExtension } from "../../renderer/components/test-utils/get-renderer-extension-fake";
import { getRendererExtensionFakeFor } from "../../renderer/components/test-utils/get-renderer-extension-fake";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("status-bar-items-originating-from-extensions", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.unoverride(getRandomIdInjectable);
      rendererDi.permitSideEffects(getRandomIdInjectable);
    });
  });

  describe("when application starts", () => {
    let rendered: RenderResult;
    let getRendererExtensionFake: GetRendererExtensionFake;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
      getRendererExtensionFake = getRendererExtensionFakeFor(applicationBuilder);
    });

    it("when multiple extensions with status bar items are loaded, shows items in correct order", () => {
      const testExtension1 = getRendererExtensionFake({
        id: "some-id",
        name: "some-name",

        statusBarItems: [
          {
            components: {
              Item: () => <div data-testid="some-testId">extension1</div>,
              position: "right",
            },
          },
        ],
      });

      const testExtension2 = getRendererExtensionFake({
        id: "some-other-id",
        name: "some-other-name",
        statusBarItems: [
          {
            components: {
              Item: () => <div data-testid="some-testId">extension2</div>,
              position: "right",
            },
          },
        ],
      });

      applicationBuilder.extensions.renderer.enable(testExtension1, testExtension2);

      const rightSide = rendered.getByTestId("status-bar-right");

      const actual = getTestStatusBarTexts(rightSide, [
        "extension1",
        "extension2",
      ]);

      expect(actual).toEqual(["extension2", "extension1"]);
    });

    describe("when extension with status bar items is loaded", () => {
      let testExtension: TestExtension;

      beforeEach(() => {
        testExtension = getRendererExtensionFake({
          id: "some-id",
          name: "some-name",
          statusBarItems: [
            {
              item: () => <span data-testid="some-testId">right1</span>,
            },
            {
              item: () => <span data-testid="some-testId">right2</span>,
            },
            {
              components: {
                Item: () => <div data-testid="some-testId">right3</div>,
                position: "right",
              },
            },
            {
              components: {
                Item: () => <div data-testid="some-testId">left1</div>,
                position: "left",
              },
            },
            {
              components: {
                Item: () => <div data-testid="some-testId">left2</div>,
                position: "left",
              },
            },
          ],
        });

        applicationBuilder.extensions.renderer.enable(testExtension);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows right side status bar items in the correct order", () => {
        const rightSide = rendered.getByTestId("status-bar-right");

        const actual = getTestStatusBarTexts(rightSide, [
          "right1",
          "right2",
          "right3",
        ]);

        expect(actual).toEqual(["right3", "right2", "right1"]);
      });

      it("shows left side status bar items in the correct order", () => {
        const leftSide = rendered.getByTestId("status-bar-left");

        const actual = getTestStatusBarTexts(leftSide, ["left2", "left1"]);

        expect(actual).toEqual(["left1", "left2"]);
      });

      it("when the extension is removed, shows there are no extension status bar items", () => {
        applicationBuilder.extensions.renderer.disable(testExtension);

        const actual = rendered.queryAllByTestId("some-testId");

        expect(actual).toHaveLength(0);
      });
    });
  });
});

const getTestStatusBarTexts = (actual: HTMLElement, expectedTexts: string[]) =>
  Array.from(actual.children)
    .map((elem) => elem.textContent)
    .filter((elem) => elem && expectedTexts.includes(elem));
