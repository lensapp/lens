/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { ApplicationBuilder } from "../test-utils/get-application-builder";
import { getApplicationBuilder } from "../test-utils/get-application-builder";
import setStatusBarStatusInjectable from "./set-status-bar-status.injectable";
import type { RenderResult } from "@testing-library/react";
import { getRandomIdInjectionToken } from "@k8slens/random";

describe("<StatusBar />", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.permitSideEffects(getRandomIdInjectionToken);
      windowDi.unoverride(getRandomIdInjectionToken);
    });

    result = await builder.render();
  });

  describe("when an extension is enabled with no status items", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",

        rendererOptions: {
          statusBarItems: [],
        },
      });
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });
  });

  describe.each([
    undefined,
    "hello",
    6,
    null,
    [],
    [{}],
    {},
  ])("when an extension is enabled with an invalid data type, (%p)", (value) => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",

        rendererOptions: {
          statusBarItems: [value as any],
        },
      });
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });
  });

  describe("when an extension is enabled using a deprecated registration of a plain ReactNode", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",

        rendererOptions: {
          statusBarItems: [{
            item: "heeeeeeee",
          }],
        },
      });
    });

    it("renders the provided ReactNode", () => {
      expect(result.baseElement).toHaveTextContent("heeeeeeee");
    });
  });

  describe("when an extension is enabled using a deprecated registration of a function returning a ReactNode", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",

        rendererOptions: {
          statusBarItems: [{
            item: () => "heeeeeeee",
          }],
        },
      });
    });

    it("renders the provided ReactNode", () => {
      expect(result.baseElement).toHaveTextContent("heeeeeeee");
    });
  });

  describe("when an extension is enabled specifying the side the elements should be on", () => {
    beforeEach(() => {
      builder.extensions.enable({
        id: "some-id",
        name: "some-name",

        rendererOptions: {
          statusBarItems: [
            {
              components: {
                Item: () => <div data-testid="sortedElem">right1</div>,
              },
            },
            {
              components: {
                Item: () => <div data-testid="sortedElem">right2</div>,
                position: "right",
              },
            },
            {
              components: {
                Item: () => <div data-testid="sortedElem">left1</div>,
                position: "left",
              },
            },
            {
              components: {
                Item: () => <div data-testid="sortedElem">left2</div>,
                position: "left",
              },
            },
          ],
        },
      });
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("sort positioned items properly", async () => {
      const elems = result.getAllByTestId("sortedElem");
      const positions = elems.map(elem => elem.textContent);

      expect(positions).toEqual(["left1", "left2", "right2", "right1"]);
    });
  });

  it("has the default status by default", () => {
    expect([...result.getByTestId("status-bar").classList]).toEqual(["StatusBar"]);
  });

  describe.each([
    "warning" as const,
    "error" as const,
  ])("when StatusBar's status is set to %p", (value) => {
    beforeEach(() => {
      const di = builder.applicationWindow.only.di;
      const setStatusBarStatus = di.inject(setStatusBarStatusInjectable);

      setStatusBarStatus(value);
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it(`has the ${value} status by default`, () => {
      expect([...result.getByTestId("status-bar").classList]).toContain(`status-${value}`);
    });
  });
});
