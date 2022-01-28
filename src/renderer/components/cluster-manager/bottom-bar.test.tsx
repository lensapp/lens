/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { BottomBar } from "./bottom-bar";
import { StatusBarRegistry } from "../../../extensions/registries";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { DiRender, renderFor } from "../test-utils/renderFor";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";


describe("<BottomBar />", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);
    StatusBarRegistry.createInstance();
  });

  afterEach(() => {
    StatusBarRegistry.resetInstance();
  });

  it("renders w/o errors", () => {
    const { container } = render(<BottomBar />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it.each([
    undefined,
    "hello",
    6,
    null,
    [],
    [{}],
    {},
  ])("renders w/o errors when .getItems() returns not type compliant (%p)", val => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => val);
    expect(() => render(<BottomBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });


  it("sort positioned items properly", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      {
        components: {
          Item: () => <div data-testid="sortedElem">right</div>,
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">right</div>,
          position: "right",
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">left</div>,
          position: "left",
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">left</div>,
          position: "left",
        },
      },
    ]);

    const { getAllByTestId } = render(<BottomBar />);
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left", "left", "right", "right"]);
  });
});
