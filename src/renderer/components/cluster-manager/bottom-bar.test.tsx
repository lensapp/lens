/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { BottomBar } from "./bottom-bar";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import directoryForUserDataInjectable  from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { computed, IObservableArray, observable, runInAction } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

jest.mock("electron", () => ({
  app: {
    getPath: () => "/foo",
  },
}));

class SomeTestExtension extends LensRendererExtension {
  constructor(statusBarItems: IObservableArray<any>) {
    super({
      id: "some-id",
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: "some-id", version: "some-version" },
      manifestPath: "irrelevant",
    });

    this.statusBarItems = statusBarItems;
  }
}

describe("<BottomBar />", () => {
  let render: DiRender;
  let statusBarItems: IObservableArray<any>;

  beforeEach(async () => {

    statusBarItems = observable.array([]);

    const someTestExtension = new SomeTestExtension(statusBarItems);

    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    di.override(rendererExtensionsInjectable, () => {
      return computed(() => [someTestExtension]);
    });

    render = renderFor(di);

    await di.runSetups();
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
    runInAction(() => {
      statusBarItems.replace([val]);
    });

    expect(() => render(<BottomBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", () => {
    const testId = "testId";
    const text = "heee";

    runInAction(() => {
      statusBarItems.replace([
        { item: <span data-testid={testId} >{text}</span> },
      ]);
    });

    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", () => {
    const testId = "testId";
    const text = "heee";

    runInAction(() => {
      statusBarItems.replace([
        { item: () => <span data-testid={testId} >{text}</span> },
      ]);
    });

    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });


  it("sort positioned items properly", () => {
    runInAction(() => {
      statusBarItems.replace([
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
    });

    const { getAllByTestId } = render(<BottomBar />);
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left", "left", "right", "right"]);
  });
});
