/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { IObservableArray } from "mobx";
import { computed, observable } from "mobx";
import type { StatusBarItems } from "./status-bar-items.injectable";
import statusBarItemsInjectable from "./status-bar-items.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { ApplicationBuilder } from "../test-utils/get-application-builder";
import { getApplicationBuilder } from "../test-utils/get-application-builder";
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";

describe("<StatusBar />", () => {
  let statusBarItems: IObservableArray<any>;
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    statusBarItems = observable.array([]);

    builder = getApplicationBuilder();

    builder.beforeWindowStart((windowDi) => {
      windowDi.unoverride(getRandomIdInjectable);
      windowDi.permitSideEffects(getRandomIdInjectable);
      windowDi.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    });

    builder.extensions.enable({
      id: "some-id",
      name: "some-name",

      rendererOptions: {
        statusBarItems,
      },
    });
  });

  it("renders w/o errors", async () => {
    const { container } = await builder.render();

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
  ])("renders w/o errors when registrations are not type compliant (%p)", async val => {
    statusBarItems.replace([val]);

    await expect(builder.render()).resolves.toBeTruthy();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", async () => {
    const testId = "testId";
    const text = "heee";

    builder.beforeWindowStart((windowDi) => {
      windowDi.override(statusBarItemsInjectable, () => computed(() => ({
        right: [ () => <span data-testid={testId} >{text}</span> ],
        left: [],
      }) as StatusBarItems));
    });

    const { getByTestId } = await builder.render();

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", async () => {
    const testId = "testId";
    const text = "heee";

    statusBarItems.replace([{
      item: () => <span data-testid={testId} >{text}</span>,
    }]);

    const { getByTestId } = await builder.render();

    expect(getByTestId(testId)).toHaveTextContent(text);
  });


  it("sort positioned items properly", async () => {
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

    const { getAllByTestId } = await builder.render();
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left1", "left2", "right2", "right1"]);
  });
});
