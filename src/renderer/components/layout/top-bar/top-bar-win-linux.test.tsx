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
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { TopBar } from "./top-bar";
import { IpcMainWindowEvents } from "../../../../main/window-manager";
import { broadcastMessage } from "../../../../common/ipc";
import * as vars from "../../../../common/vars";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { DiRender, renderFor } from "../../test-utils/renderFor";

const mockConfig = vars as { isWindows: boolean; isLinux: boolean };

jest.mock("../../../../common/ipc");

jest.mock("../../../../common/vars", () => {
  const SemVer = require("semver").SemVer;

  const versionStub = new SemVer("1.0.0");

  return {
    __esModule: true,
    isWindows: null,
    isLinux: null,
    appSemVer: versionStub,
  };
});

const mockMinimize = jest.fn();
const mockMaximize = jest.fn();
const mockUnmaximize = jest.fn();
const mockClose = jest.fn();

jest.mock("@electron/remote", () => {
  return {
    getCurrentWindow: () => ({
      minimize: () => mockMinimize(),
      maximize: () => mockMaximize(),
      unmaximize: () => mockUnmaximize(),
      close: () => mockClose(),
      isMaximized: () => false,
    }),
  };
});

describe("<TopBar/> in Windows and Linux", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    render = renderFor(di);
  });

  it("shows window controls on Windows", () => {
    mockConfig.isWindows = true;
    mockConfig.isLinux = false;

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("shows window controls on Linux", () => {
    mockConfig.isWindows = false;
    mockConfig.isLinux = true;

    const { getByTestId } = render(<TopBar />);

    expect(getByTestId("window-menu")).toBeInTheDocument();
    expect(getByTestId("window-minimize")).toBeInTheDocument();
    expect(getByTestId("window-maximize")).toBeInTheDocument();
    expect(getByTestId("window-close")).toBeInTheDocument();
  });

  it("triggers ipc events on click", () => {
    mockConfig.isWindows = true;

    const { getByTestId } = render(<TopBar />);

    const menu = getByTestId("window-menu");
    const minimize = getByTestId("window-minimize");
    const maximize = getByTestId("window-maximize");
    const close = getByTestId("window-close");

    fireEvent.click(menu);
    expect(broadcastMessage).toHaveBeenCalledWith(IpcMainWindowEvents.OPEN_CONTEXT_MENU);

    fireEvent.click(minimize);
    expect(mockMinimize).toHaveBeenCalled();

    fireEvent.click(maximize);
    expect(mockMaximize).toHaveBeenCalled();

    fireEvent.click(close);
    expect(mockClose).toHaveBeenCalled();
  });
});
