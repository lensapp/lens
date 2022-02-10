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
import { computed, IObservableArray, observable } from "mobx";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import statusBarItemsInjectable from "./status-bar-items.injectable";
import type { StatusBarRegistration } from "./status-bar-registration";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";

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

describe("<StatusBar />", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;
  let statusBarItems: IObservableArray<any>;

  beforeEach(async () => {
    statusBarItems = observable.array([]);
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(rendererExtensionsInjectable, () => computed(() => [new SomeTestExtension(statusBarItems)]));

    await di.runSetups();
  });

  it("renders w/o errors", () => {
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
    statusBarItems.replace([val]);

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

    statusBarItems.replace([{
      item: () => <span data-testid={testId} >{text}</span>,
    }]);

    const { getByTestId } = render(<StatusBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });


  it("sort positioned items properly", () => {
    statusBarItems.replace([
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
    ]);

    const { getAllByTestId } = render(<StatusBar />);
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left1", "left2", "right2", "right1"]);
  });
});
