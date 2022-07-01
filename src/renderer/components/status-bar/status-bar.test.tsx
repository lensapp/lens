/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { IObservableArray } from "mobx";
import { computed, observable } from "mobx";
import type { DiContainer } from "@ogre-tools/injectable";
import type { StatusBarItems } from "./status-bar-items.injectable";
import statusBarItemsInjectable from "./status-bar-items.injectable";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { ApplicationBuilder } from "../test-utils/get-application-builder";
import { getApplicationBuilder } from "../test-utils/get-application-builder";
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";

class SomeTestExtension extends LensRendererExtension {
  constructor(statusBarItems: IObservableArray<any>) {
    super({
      id: "some-id",
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: "some-id", version: "some-version", engines: { lens: "^5.5.0" }},
      manifestPath: "irrelevant",
    });

    this.statusBarItems = statusBarItems;
  }
}

describe("<StatusBar />", () => {
  let di: DiContainer;
  let statusBarItems: IObservableArray<any>;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(async () => {
    statusBarItems = observable.array([]);

    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.unoverride(getRandomIdInjectable);
      rendererDi.permitSideEffects(getRandomIdInjectable);
    });

    applicationBuilder.extensions.renderer.enable(new SomeTestExtension(statusBarItems));
    
    di = applicationBuilder.dis.rendererDi;

    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
  });

  it("renders w/o errors", async () => {
    const { container } = await applicationBuilder.render();

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

    await expect(applicationBuilder.render()).resolves.toBeTruthy();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", async () => {
    const testId = "testId";
    const text = "heee";

    di.override(statusBarItemsInjectable, () => computed(() => ({
      right: [ () => <span data-testid={testId} >{text}</span> ],
      left: [],
    }) as StatusBarItems));

    const { getByTestId } = await applicationBuilder.render();

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", async () => {
    const testId = "testId";
    const text = "heee";

    statusBarItems.replace([{
      item: () => <span data-testid={testId} >{text}</span>,
    }]);

    const { getByTestId } = await applicationBuilder.render();

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

    const { getAllByTestId } = await applicationBuilder.render();
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left1", "left2", "right2", "right1"]);
  });
});
