/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "@testing-library/jest-dom/extend-expect";
import { HotbarRemoveCommand } from "../hotbar-remove-command";
import { fireEvent } from "@testing-library/react";
import React from "react";
import { AppPaths } from "../../../../common/app-paths";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import hotbarManagerInjectable from "../../../../common/hotbar-store.injectable";
import { UserStore } from "../../../../common/user-store";
import { ThemeStore } from "../../../theme.store";
import { ConfirmDialog } from "../../confirm-dialog";
import type { HotbarStore } from "../../../../common/hotbar-store";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

AppPaths.init();

const mockHotbars: { [id: string]: any } = {
  "1": {
    id: "1",
    name: "Default",
    items: [] as any,
  },
};

describe("<HotbarRemoveCommand />", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let render: DiRender;

  beforeEach(() => {
    di = getDiForUnitTesting();
    render = renderFor(di);

    UserStore.createInstance();
    ThemeStore.createInstance();
  });

  afterEach(() => {
    ThemeStore.resetInstance();
    UserStore.resetInstance();
  });

  it("renders w/o errors", () => {
    di.override(hotbarManagerInjectable, () => ({
      hotbars: [mockHotbars["1"]],
      getById: (id: string) => mockHotbars[id],
      remove: () => { },
      hotbarIndex: () => 0,
      getDisplayLabel: () => "1: Default",
    }) as any as HotbarStore);

    const { container } = render(<HotbarRemoveCommand/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("calls remove if you click on the entry", () => {
    const removeMock = jest.fn();

    di.override(hotbarManagerInjectable, () => ({
      hotbars: [mockHotbars["1"]],
      getById: (id: string) => mockHotbars[id],
      remove: removeMock,
      hotbarIndex: () => 0,
      getDisplayLabel: () => "1: Default",
    }) as any as HotbarStore);

    const { getByText } = render(
      <>
        <HotbarRemoveCommand />
        <ConfirmDialog />
      </>,
    );

    fireEvent.click(getByText("1: Default"));
    fireEvent.click(getByText("Remove Hotbar"));

    expect(removeMock).toHaveBeenCalled();
  });
});
