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
import { TopBar } from "../topbar";
import { TopBarRegistry } from "../../../../extensions/registries";

jest.mock("../../../../common/ipc");
jest.mock("../../../../common/vars", () => {
  return {
    isLinux: true,
    isWindows: false,
  };
});

describe("<Tobar/> in Linux", () => {
  beforeEach(() => {
    TopBarRegistry.createInstance();
  });

  afterEach(() => {
    TopBarRegistry.resetInstance();
  });

  it("shows menu icon", () => {
    const { getByTestId } = render(<TopBar/>);

    expect(getByTestId("window-menu")).toBeInTheDocument();
  });

  it("doesn't show windows title buttons", () => {
    const { queryByTestId } = render(<TopBar/>);

    expect(queryByTestId("window-minimize")).not.toBeInTheDocument();
    expect(queryByTestId("window-maximize")).not.toBeInTheDocument();
    expect(queryByTestId("window-close")).not.toBeInTheDocument();
  });
});
