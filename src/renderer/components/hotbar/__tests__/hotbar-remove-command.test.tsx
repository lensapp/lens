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
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeStore } from "../../../theme.store";
import { UserStore } from "../../../../common/user-store";
import { Notifications } from "../../notifications";
import mockFs from "mock-fs";
import { AppPaths } from "../../../../common/app-paths";

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

jest.mock("../../../../common/hotbar-store", () => ({
  HotbarStore: {
    getInstance: () => ({
      hotbars: [mockHotbars["1"]],
      getById: (id: string) => mockHotbars[id],
      remove: () => {},
      hotbarIndex: () => 0,
    }),
  },
}));

describe("<HotbarRemoveCommand />", () => {
  beforeEach(() => {
    mockFs({
      "tmp": {},
    });
    UserStore.createInstance();
    ThemeStore.createInstance();
  });

  afterEach(() => {
    UserStore.resetInstance();
    ThemeStore.resetInstance();
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const { container } = render(<HotbarRemoveCommand/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("displays error notification if user tries to remove last hotbar", () => {
    const spy = jest.spyOn(Notifications, "error");
    const { getByText } = render(<HotbarRemoveCommand/>);

    fireEvent.click(getByText("1: Default"));

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
