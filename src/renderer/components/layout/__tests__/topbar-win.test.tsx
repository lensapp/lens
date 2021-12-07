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

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "../topbar";
import { TopBarRegistry } from "../../../../extensions/registries";
import { IpcMainWindowEvents } from "../../../../main/window-manager";
import { broadcastMessage } from "../../../../common/ipc";

jest.mock("../../../../common/ipc");

jest.mock("../../../../common/vars", () => {
  return {
    isWindows: true,
    isLinux: false,
  };
});

describe("<Tobar/> in Windows", () => {
  beforeEach(() => {
    TopBarRegistry.createInstance();
  });

  afterEach(() => {
    TopBarRegistry.resetInstance();
  });

  it("shows window controls", () => {
    const { getByTestId } = render(<TopBar/>);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("triggers ipc events on click", () => {
    const { getByTestId } = render(<TopBar/>);

    const menu = getByTestId("window-menu");
    const minimize = getByTestId("window-minimize");
    const maximize = getByTestId("window-maximize");
    const close = getByTestId("window-close");

    fireEvent.click(menu);
    expect(broadcastMessage).toHaveBeenCalledWith(IpcMainWindowEvents.OPEN_CONTEXT_MENU);

    fireEvent.click(minimize);
    expect(broadcastMessage).toHaveBeenCalledWith(IpcMainWindowEvents.MINIMIZE);

    fireEvent.click(maximize);
    expect(broadcastMessage).toHaveBeenCalledWith(IpcMainWindowEvents.MAXIMIZE);

    fireEvent.click(close);
    expect(broadcastMessage).toHaveBeenCalledWith(IpcMainWindowEvents.CLOSE);
  });
});
