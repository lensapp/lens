/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { createContainer } from "@ogre-tools/injectable";
import countdownStateInjectable from "./countdown-state.injectable";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { Countdown } from "./countdown";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import type { IComputedValue } from "mobx";
import { observe } from "mobx";
import { noop } from "@k8slens/utilities";
import { testUsingFakeTime, advanceFakeTime } from "../../../test-utils/use-fake-time";

describe("countdown", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(() => {
    testUsingFakeTime("2015-10-21T07:28:00Z");

    di = createContainer("irrelevant");

    render = renderFor(di);

    di.register(countdownStateInjectable);
  });

  describe("when rendering countdown", () => {
    let rendered: RenderResult;
    let onZeroMock: jest.Mock;

    beforeEach(() => {
      onZeroMock = jest.fn();

      const secondsTill = di.inject(countdownStateInjectable, {
        startFrom: 42,
        onZero: onZeroMock,
      });

      rendered = render(
        <Countdown secondsTill={secondsTill} />,
      );
    });

    it("renders with initial seconds", () => {
      expect(rendered.container).toHaveTextContent("42");
    });

    describe("when time passes", () => {
      beforeEach(() => {
        advanceFakeTime(1000);
      });

      it("updates the seconds", () => {
        expect(rendered.container).toHaveTextContent("41");
      });

      it("does not call callback yet", () => {
        expect(onZeroMock).not.toHaveBeenCalled();
      });
    });

    it("when just not enough time passes to fulfill the countdown, does not call the callback yet", () => {
      advanceFakeTime(41 * 1000);

      expect(onZeroMock).not.toHaveBeenCalled();
    });

    describe("when time passes enough to fulfill the countdown", () => {
      beforeEach(() => {
        advanceFakeTime(42 * 1000);
      });

      it("shows zero as seconds", () => {
        expect(rendered.container).toHaveTextContent("0");
      });

      it("calls the callback", () => {
        expect(onZeroMock).toHaveBeenCalled();
      });

      describe("when time passes even more", () => {
        beforeEach(() => {
          onZeroMock.mockClear();

          advanceFakeTime(1000);
        });

        it("does not update the countdown anymore", () => {
          expect(rendered.container).toHaveTextContent("0");
        });

        it("does not call the callback", () => {
          expect(onZeroMock).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe("given observed", () => {
    let onZeroMock: jest.Mock;
    let unobserve: () => void;
    let secondsTill: IComputedValue<number>;

    beforeEach(() => {
      onZeroMock = jest.fn();

      secondsTill = di.inject(countdownStateInjectable, {
        startFrom: 1,
        onZero: onZeroMock,
      });

      unobserve = observe(secondsTill, noop);
    });

    describe("given unobserved, when enough time passes so that it would fulfill the countdown", () => {
      beforeEach(() => {
        onZeroMock.mockClear();

        unobserve();

        advanceFakeTime(1000);
      });

      it("does not call callback yet", () => {
        expect(onZeroMock).not.toHaveBeenCalled();
      });

      it("given observed again, when time passes to fulfill the countdown, calls the callback", () => {
        observe(secondsTill, noop);

        advanceFakeTime(1000);

        expect(onZeroMock).toHaveBeenCalled();
      });
    });
  });
});
