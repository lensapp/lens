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
import mockFs from "mock-fs";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BottomBar } from "./bottom-bar";
import { StatusBarRegistry } from "../../../extensions/registries";
import { HotbarStore } from "../../../common/hotbar-store";
import { AppPaths } from "../../../common/app-paths";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "../hotbar/hotbar-switch-command";
import { ActiveHotbarName } from "./active-hotbar-name";

jest.mock("../command-palette", () => ({
  CommandOverlay: {
    open: jest.fn(),
  },
}));

AppPaths.init();

jest.mock("electron", () => ({
  app: {
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
}));

describe("<BottomBar />", () => {
  beforeEach(() => {
    const mockOpts = {
      "tmp": {
        "test-store.json": JSON.stringify({}),
      },
    };

    mockFs(mockOpts);
    StatusBarRegistry.createInstance();
    HotbarStore.createInstance();
  });

  afterEach(() => {
    StatusBarRegistry.resetInstance();
    HotbarStore.resetInstance();
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const { container } = render(<BottomBar />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders w/o errors when .getItems() returns unexpected (not type compliant) data", async () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => undefined);
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => "hello");
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => 6);
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => null);
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => []);
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [{}]);
    expect(() => render(<BottomBar />)).not.toThrow();
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => { return {};});
    expect(() => render(<BottomBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", async () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(await getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", async () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(await getByTestId(testId)).toHaveTextContent(text);
  });

  it("show default hotbar name", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <ActiveHotbarName/> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId("current-hotbar-name")).toHaveTextContent("default");
  });

  it("show active hotbar name", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <ActiveHotbarName/> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    HotbarStore.getInstance().add({
      id: "new",
      name: "new",
    }, { setActive: true });

    expect(getByTestId("current-hotbar-name")).toHaveTextContent("new");
  });

  it("opens command palette on click", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <ActiveHotbarName/> },
    ]);
    const { getByTestId } = render(<BottomBar />);
    const activeHotbar = getByTestId("current-hotbar-name");

    fireEvent.click(activeHotbar);

    expect(CommandOverlay.open).toHaveBeenCalledWith(<HotbarSwitchCommand />);
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
