/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import assert from "assert";
import React from "react";
import { computeNextPosition, RectangleDimensions } from "./helpers";
import { Tooltip, TooltipPosition } from "./tooltip";

const getRectangle = (parts: Omit<RectangleDimensions, "width" | "height">): RectangleDimensions => {
  assert(parts.right >= parts.left);
  assert(parts.bottom >= parts.top);

  return {
    ...parts,
    width: parts.right - parts.left,
    height: parts.bottom - parts.top,
  };
};

describe("<Tooltip />", () => {
  let requestAnimationFrameSpy: jest.SpyInstance<number, [callback: FrameRequestCallback]>;

  beforeEach(() => {
    requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame");

    requestAnimationFrameSpy.mockImplementation((cb) => {
      cb(0);

      return 0;
    });
  });

  afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
  });

  it("does not render to DOM if not visible", () => {
    const result = render(
      <>
        <Tooltip targetId="my-target" usePortal={false}>
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </>,
    );

    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders to DOM when hovering over target", () => {
    const result = render(
      <>
        <Tooltip targetId="my-target" data-testid="tooltip" usePortal={false}>
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </>,
    );

    const target = result.baseElement.querySelector("#my-target");

    assert(target);

    userEvent.hover(target);
    expect(result.baseElement).toMatchSnapshot();
  });

  it("renders to DOM when forced to by visible prop", () => {
    const result = render(
      <>
        <Tooltip targetId="my-target" data-testid="tooltip" visible={true} usePortal={false}>
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </>,
    );

    expect(result.baseElement).toMatchSnapshot();
  });

  it("uses a portal if usePortal is specified", () => {
    const result = render(
      <div>
        <Tooltip targetId="my-target" data-testid="tooltip" visible={true} usePortal>
          I am a tooltip
        </Tooltip>
        <div id="my-target">Target Text</div>
      </div>,
    );

    expect(result.baseElement).toMatchSnapshot();
  });

  describe("when specifying a tooltip for a component", () => {
    let result: RenderResult;

    beforeEach(() => {
      result = render(
        <div>
          <Tooltip targetId="my-target" data-testid="tooltip">
            I am a tooltip
          </Tooltip>
          <div id="my-target" data-testid="target">
            Target Text
          </div>
        </div>,
      );
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("doesn't render the tooltip", () => {
      expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
    });

    describe("when hovering over the target element", () => {
      beforeEach(() => {
        userEvent.hover(result.getByTestId("target"));
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("renders the tooltip", () => {
        expect(result.getByTestId("tooltip")).toBeInTheDocument();
      });

      describe("when no longer hovering the target", () => {
        beforeEach(() => {
          userEvent.unhover(result.getByTestId("target"));
        });

        it("renders", () => {
          expect(result.baseElement).toMatchSnapshot();
        });

        it("doesn't render the tooltip", () => {
          expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when specifying a tooltip for a component with show on parent hover", () => {
    let result: RenderResult;

    beforeEach(() => {
      result = render(
        <div>
          <Tooltip targetId="my-target" data-testid="tooltip" tooltipOnParentHover>
            I am a tooltip
          </Tooltip>
          <div data-testid="target-parent">
            <div id="my-target" data-testid="target">
              Target Text
            </div>
          </div>
        </div>,
      );
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("doesn't render the tooltip", () => {
      expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
    });

    describe("when hovering over the target element", () => {
      beforeEach(() => {
        userEvent.hover(result.getByTestId("target"));
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("renders the tooltip", () => {
        expect(result.getByTestId("tooltip")).toBeInTheDocument();
      });

      describe("when no longer hovering the target", () => {
        beforeEach(() => {
          userEvent.unhover(result.getByTestId("target"));
        });

        it("renders", () => {
          expect(result.baseElement).toMatchSnapshot();
        });

        it("doesn't render the tooltip", () => {
          expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
        });
      });
    });

    describe("when hovering over the target's parent element", () => {
      beforeEach(() => {
        userEvent.hover(result.getByTestId("target-parent"));
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("renders the tooltip", () => {
        expect(result.getByTestId("tooltip")).toBeInTheDocument();
      });

      describe("when no longer hovering the target's parent", () => {
        beforeEach(() => {
          userEvent.unhover(result.getByTestId("target-parent"));
        });

        it("renders", () => {
          expect(result.baseElement).toMatchSnapshot();
        });

        it("doesn't render the tooltip", () => {
          expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("when specifying a tooltip for a component that doesn't exist with show on parent hover", () => {
    let result: RenderResult;

    beforeEach(() => {
      result = render(
        <>
          <Tooltip targetId="my-target" data-testid="tooltip" tooltipOnParentHover>
            I am a tooltip
          </Tooltip>
        </>,
      );
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("doesn't render the tooltip", () => {
      expect(result.queryByTestId("tooltip")).not.toBeInTheDocument();
    });
  });
});

describe("computeNextPosition technical tests", () => {
  describe("given a 1280x720 window", () => {
    beforeEach(() => {
      window.innerHeight = 720;
      window.innerWidth = 1280;
    });

    [
      {
        position: "right",
        targetRect: {
          top: 700,
          left: 700,
          bottom: 720,
          right: 720,
        },
      },
      {
        position: "bottom",
        targetRect: {
          top: 500,
          left: 1200,
          bottom: 520,
          right: 1280,
        },
      },
      {
        position: "top",
        targetRect: {
          top: 700,
          left: 1200,
          bottom: 720,
          right: 1280,
        },
      },
      {
        position: "left",
        targetRect: {
          top: 0,
          left: 1200,
          bottom: 720,
          right: 1280,
        },
      },
    ].forEach(({ position, targetRect }) => {
      it(`renders to the "${position}" by default if there is enough room`, () => {
        expect(
          computeNextPosition({
            offset: 10,
            target: {
              getBoundingClientRect: () => getRectangle(targetRect),
            },
            tooltip: {
              getBoundingClientRect: () => ({
                height: 20,
                width: 20,
              }),
            },
          }),
        ).toMatchObject({
          position,
        });
      });
    });

    it("doesn't throw if the preferredPosition is invalid", () => {
      expect(
        computeNextPosition({
          preferredPositions: "some-invalid-data" as any,
          offset: 10,
          target: {
            getBoundingClientRect: () =>
              getRectangle({
                top: 50,
                left: 50,
                bottom: 100,
                right: 100,
              }),
          },
          tooltip: {
            getBoundingClientRect: () => ({
              height: 20,
              width: 20,
            }),
          },
        }),
      ).toMatchObject({
        position: "right",
      });
    });

    it("defaults to right if no other location works", () => {
      expect(
        computeNextPosition({
          offset: 10,
          target: {
            getBoundingClientRect: () =>
              getRectangle({
                top: 0,
                left: 0,
                bottom: 720,
                right: 1280,
              }),
          },
          tooltip: {
            getBoundingClientRect: () => ({
              height: 20,
              width: 20,
            }),
          },
        }),
      ).toMatchObject({
        position: "right",
      });
    });

    it.each([
      TooltipPosition.RIGHT,
      TooltipPosition.BOTTOM,
      TooltipPosition.TOP,
      TooltipPosition.LEFT,
      TooltipPosition.TOP_RIGHT,
      TooltipPosition.TOP_LEFT,
      TooltipPosition.BOTTOM_RIGHT,
      TooltipPosition.BOTTOM_LEFT,
    ])("computes to the %p if there is space and it is specified as a preferred position", (position) => {
      expect(
        computeNextPosition({
          preferredPositions: position,
          offset: 10,
          target: {
            getBoundingClientRect: () =>
              getRectangle({
                top: 50,
                left: 50,
                bottom: 100,
                right: 100,
              }),
          },
          tooltip: {
            getBoundingClientRect: () => ({
              height: 20,
              width: 20,
            }),
          },
        }),
      ).toMatchObject({
        position,
      });
    });
  });
});
