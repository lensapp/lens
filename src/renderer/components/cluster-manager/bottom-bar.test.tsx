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
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("electron", () => ({
  app: {
    getPath: () => "/foo",
  },
}));

import { BottomBar } from "./bottom-bar";
import { StatusBarRegistry } from "../../../extensions/registries";

describe("<BottomBar />", () => {
  beforeEach(() => {
    StatusBarRegistry.createInstance();
  });

  afterEach(() => {
    StatusBarRegistry.resetInstance();
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
});
