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

describe("<TopBar/>", () => {
  beforeEach(() => {
    TopBarRegistry.createInstance();
  });

  afterEach(() => {
    TopBarRegistry.resetInstance();
  });

  it("renders w/o errors", () => {
    const { container } = render(<TopBar label="test bar" />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("renders title", async () => {
    const { getByTestId } = render(<TopBar label="topbar" />);

    expect(await getByTestId("topbarLabel")).toHaveTextContent("topbar");
  });

  it("renders items", async () => {
    const testId = "testId";
    const text = "an item";

    TopBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      {
        components: {
          Item: () => <span data-testid={testId}>{text}</span>
        }
      }
    ]);

    const { getByTestId } = render(<TopBar label="topbar" />);

    expect(await getByTestId(testId)).toHaveTextContent(text);
  });
});
