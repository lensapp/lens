/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { RenderDelay } from "../render-delay";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import cancelIdleCallbackInjectable from "../cancel-idle-callback.injectable";
import requestIdleCallbackInjectable from "../request-idle-callback.injectable";
import type { RenderResult } from "@testing-library/react";
import idleCallbackTimeoutInjectable from "../idle-callback-timeout.injectable";
import { testUsingFakeTime, advanceFakeTime } from "../../../../test-utils/use-fake-time";

describe("<RenderDelay/>", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);

    testUsingFakeTime("2020-01-17 12:18:19");

    di.override(cancelIdleCallbackInjectable, () => clearTimeout);
    di.override(requestIdleCallbackInjectable, () => (callback, opts) => setTimeout(callback, opts.timeout) as any);
    di.override(idleCallbackTimeoutInjectable, () => 5);
  });

  describe("when rendered without placeholder", () => {
    let result: RenderResult;

    beforeEach(() => {
      result = render((
        <RenderDelay>
          <div data-testid="child" />
        </RenderDelay>
      ));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("does not show the children yet", () => {
      expect(result.queryByTestId("child")).not.toBeInTheDocument();
    });

    describe("when the idle callback is called", () => {
      beforeEach(() => {
        advanceFakeTime(5);
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("shows the children", () => {
        expect(result.queryByTestId("child")).toBeInTheDocument();
      });
    });
  });

  describe("when rendered with placeholder", () => {
    let result: RenderResult;

    beforeEach(() => {
      result = render((
        <RenderDelay
          placeholder={<div data-testid="placeholder"></div>}
        >
          <div data-testid="child" />
        </RenderDelay>
      ));
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("does not show the children yet", () => {
      expect(result.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("shows the placeholder", () => {
      expect(result.queryByTestId("placeholder")).toBeInTheDocument();
    });

    describe("when the idle callback is called", () => {
      beforeEach(() => {
        advanceFakeTime(5);
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("shows the children", () => {
        expect(result.queryByTestId("child")).toBeInTheDocument();
      });

      it("does not show the placeholder", () => {
        expect(result.queryByTestId("placeholder")).not.toBeInTheDocument();
      });
    });
  });
});
