/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { StatusBar } from "./status-bar";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import { computed } from "mobx";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import statusBarItemsInjectable from "./status-bar-items.injectable";
import type { StatusBarRegistration } from "./status-bar-registration";

describe("<StatusBar />", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);

    await di.runSetups();
  });

  it("renders w/o errors", () => {
    di.override(statusBarItemsInjectable, () => computed(() => [] as StatusBarRegistration[]));
    const { container } = render(<StatusBar />);

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
  ])("renders w/o errors when registrations are not type compliant (%p)", val => {
    di.override(statusBarItemsInjectable, () => computed(() => [val] as StatusBarRegistration[]));

    expect(() => render(<StatusBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", () => {
    const testId = "testId";
    const text = "heee";

    di.override(statusBarItemsInjectable, () => computed(() => [
      { item: <span data-testid={testId} >{text}</span> },
    ] as StatusBarRegistration[]));

    const { getByTestId } = render(<StatusBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", () => {
    const testId = "testId";
    const text = "heee";

    di.override(statusBarItemsInjectable, () => computed(() => [
      { item: () => <span data-testid={testId} >{text}</span> },
    ] as StatusBarRegistration[]));

    const { getByTestId } = render(<StatusBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });


  it("sort positioned items properly", () => {
    di.override(statusBarItemsInjectable, () => computed(() => [
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
    ] as StatusBarRegistration[]));

    const { getAllByTestId } = render(<StatusBar />);
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left", "left", "right", "right"]);
  });
});
