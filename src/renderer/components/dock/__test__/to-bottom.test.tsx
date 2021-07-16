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
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import { ToBottom } from "../to-bottom";
import { noop } from "../../../utils";

describe("<ToBottom/>", () => {
  it("renders w/o errors", () => {
    const { container } = render(<ToBottom onClick={noop}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("has 'To bottom' label", () => {
    const { getByText } = render(<ToBottom onClick={noop}/>);

    expect(getByText("To bottom")).toBeInTheDocument();
  });

  it("has a arrow down icon", () => {
    const { getByText } = render(<ToBottom onClick={noop}/>);

    expect(getByText("expand_more")).toBeInTheDocument();
  });

  it("fires an onclick event", () => {
    const callback = jest.fn();
    const { getByText } = render(<ToBottom onClick={callback}/>);

    fireEvent.click(getByText("To bottom"));
    expect(callback).toBeCalled();
  });
});
